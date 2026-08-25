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
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });
  revalidatePath("/admin/support");
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
