import { prisma } from "@/lib/db";

export type JournalStats = { total: number; streak: number };

/** Counts total entries and the current daily writing streak for a user. */
export async function getJournalStats(userId: string): Promise<JournalStats> {
  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    select: { createdAt: true },
  });

  const days = new Set(entries.map((e) => e.createdAt.toISOString().slice(0, 10)));

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { total: entries.length, streak };
}
