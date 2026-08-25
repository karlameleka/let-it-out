import "server-only";
import { prisma } from "@/lib/db";
import type { SupportChatMessage } from "@/lib/ai-support-chat";

export type { SupportChatMessage };

/** All live-chat conversations for the admin dashboard, most recently
 * updated first — open/escalated ones are what need attention, resolved
 * ones are kept as a record. */
export async function getAllSupportChats() {
  return prisma.supportChat.findMany({
    include: { user: { select: { name: true, email: true, accountCode: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export type SupportChatWithUser = Awaited<ReturnType<typeof getAllSupportChats>>[number];
