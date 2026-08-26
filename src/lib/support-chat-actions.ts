"use server";

import { prisma } from "@/lib/db";
import { requireUser, requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { generateSupportChatReply, type SupportChatMessage } from "@/lib/ai-support-chat";
import { sendSupportNotification } from "@/lib/email";
import { getBaseUrl } from "@/lib/base-url";

const MAX_MESSAGE_LENGTH = 2000;

export type SendSupportChatMessageResult =
  | { error: string }
  | { chatId: string; messages: SupportChatMessage[]; status: "OPEN" | "RESOLVED" | "ESCALATED" };

/** Called directly from the chat widget (not a useActionState form action)
 * since the client needs the assistant's reply back immediately to render
 * it. Creates the chat on the first message (chatId null), then appends to
 * it on every turn after. Ownership is enforced by scoping every lookup to
 * the logged-in user's own id — a tampered chatId from someone else's chat
 * is treated as "start a new one" rather than leaking their transcript. */
export async function sendSupportChatMessage(
  chatId: string | null,
  message: string,
): Promise<SendSupportChatMessageResult> {
  const session = await requireUser().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const trimmed = message.trim();
  if (!trimmed) return { error: "Please type a message." };
  if (trimmed.length > MAX_MESSAGE_LENGTH) return { error: "That message is too long." };

  const existing = chatId
    ? await prisma.supportChat.findFirst({ where: { id: chatId, userId: session.userId } })
    : null;

  const priorMessages = (existing?.messages as unknown as SupportChatMessage[]) ?? [];
  const userMessage: SupportChatMessage = { role: "user", content: trimmed, at: new Date().toISOString() };
  const historyForModel = [...priorMessages, userMessage].map((m) => ({ role: m.role, content: m.content }));

  const { reply, status } = await generateSupportChatReply(historyForModel);
  const assistantMessage: SupportChatMessage = { role: "assistant", content: reply, at: new Date().toISOString() };
  const messages = [...priorMessages, userMessage, assistantMessage];

  const wasAlreadyEscalated = existing?.escalatedAt != null;

  const chat = existing
    ? await prisma.supportChat.update({
        where: { id: existing.id },
        data: {
          messages: messages as never,
          status,
          resolvedAt: status === "RESOLVED" ? new Date() : existing.resolvedAt,
          escalatedAt: status === "ESCALATED" && !wasAlreadyEscalated ? new Date() : existing.escalatedAt,
        },
      })
    : await prisma.supportChat.create({
        data: {
          userId: session.userId,
          messages: messages as never,
          status,
          escalatedAt: status === "ESCALATED" ? new Date() : null,
        },
      });

  // Best-effort, one-time-per-chat admin notification — never blocks the
  // reply from reaching the client.
  if (status === "ESCALATED" && !wasAlreadyEscalated) {
    const baseUrl = await getBaseUrl();
    await sendSupportNotification({
      subject: "Live chat needs your attention",
      lines: [
        { label: "Client", value: `${session.name} <${session.email}>` },
        { label: "First message", value: priorMessages[0]?.content ?? trimmed },
        { label: "Review", value: `${baseUrl}/admin/support` },
      ],
    }).catch((err) => console.error("[support-chat] Failed to send escalation email:", err));
  }

  revalidatePath("/admin/support");
  return { chatId: chat.id, messages, status: chat.status };
}

export async function resolveSupportChat(formData: FormData) {
  await requireAdmin();
  const chatId = String(formData.get("chatId") ?? "");
  await prisma.supportChat.update({
    where: { id: chatId },
    // Marking it resolved here is the human's own confirmation, so any
    // earlier "client disputed this" flag no longer applies.
    data: { status: "RESOLVED", resolvedAt: new Date(), flaggedUnresolved: false },
  });
  revalidatePath("/admin/support");
}

/**
 * The post-resolution feedback loop: called from the chat widget once the
 * bot marks a chat RESOLVED, asking the client to confirm it actually
 * worked and (optionally) rate the chat. A "no" flips the chat back to
 * ESCALATED and flags it in the admin dashboard, since the bot's own
 * resolution claim turned out to be wrong.
 */
export async function submitSupportChatFeedback(
  chatId: string,
  resolved: boolean,
  rating?: number,
): Promise<{ success: boolean }> {
  const session = await requireUser().catch(() => null);
  if (!session) return { success: false };

  const chat = await prisma.supportChat.findFirst({ where: { id: chatId, userId: session.userId } });
  if (!chat) return { success: false };

  const clampedRating = rating && Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
  const wasAlreadyEscalated = chat.escalatedAt != null;

  await prisma.supportChat.update({
    where: { id: chat.id },
    data: {
      feedbackResolved: resolved,
      feedbackRating: clampedRating,
      ...(resolved
        ? {}
        : {
            status: "ESCALATED",
            flaggedUnresolved: true,
            escalatedAt: wasAlreadyEscalated ? chat.escalatedAt : new Date(),
          }),
    },
  });

  // Same best-effort, one-time-per-chat notification pattern as escalating
  // mid-conversation — a client disputing "resolved" is just as much a
  // "needs a human" signal as the bot escalating on its own.
  if (!resolved && !wasAlreadyEscalated) {
    const baseUrl = await getBaseUrl();
    const messages = chat.messages as unknown as SupportChatMessage[];
    await sendSupportNotification({
      subject: "Live chat: client says it's not actually resolved",
      lines: [
        { label: "Client", value: `${session.name} <${session.email}>` },
        { label: "First message", value: messages.find((m) => m.role === "user")?.content ?? "" },
        { label: "Review", value: `${baseUrl}/admin/support` },
      ],
    }).catch((err) => console.error("[support-chat] Failed to send unresolved-feedback email:", err));
  }

  revalidatePath("/admin/support");
  return { success: true };
}

export async function reopenSupportChat(formData: FormData) {
  await requireAdmin();
  const chatId = String(formData.get("chatId") ?? "");
  await prisma.supportChat.update({
    where: { id: chatId },
    data: { status: "OPEN", resolvedAt: null },
  });
  revalidatePath("/admin/support");
}

/** Permanently removes a resolved chat's transcript — only resolved chats
 * can be deleted from the admin UI (open/escalated ones need resolving
 * first), so a conversation still needing a reply can't be discarded by
 * accident. */
export async function deleteSupportChat(formData: FormData) {
  await requireAdmin();
  const chatId = String(formData.get("chatId") ?? "");
  const chat = await prisma.supportChat.findUnique({ where: { id: chatId }, select: { status: true } });
  if (chat?.status !== "RESOLVED") return;
  await prisma.supportChat.delete({ where: { id: chatId } });
  revalidatePath("/admin/support");
}

/** Bulk cleanup — clears every resolved chat's transcript at once. */
export async function deleteAllResolvedSupportChats() {
  await requireAdmin();
  await prisma.supportChat.deleteMany({ where: { status: "RESOLVED" } });
  revalidatePath("/admin/support");
}
