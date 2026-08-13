import { prisma } from "@/lib/db";

/** How many of a user's most recent prompts to avoid repeating. */
const RECENT_AVOID_COUNT = 15;

/**
 * Picks a new prompt each time it's called, avoiding a given user's most
 * recently used prompts so the same one doesn't resurface entry after entry.
 * Falls back to the full pool once fewer prompts remain unseen than the
 * avoidance window (or for logged-out/preview use).
 */
export async function getNextPrompt(userId?: string) {
  const total = await prisma.journalPrompt.count();
  if (total === 0) return null;

  let excludeIds: string[] = [];
  if (userId) {
    const recent = await prisma.journalEntry.findMany({
      where: { userId, promptId: { not: null } },
      orderBy: { createdAt: "desc" },
      take: Math.min(RECENT_AVOID_COUNT, Math.max(total - 1, 0)),
      select: { promptId: true },
    });
    excludeIds = [...new Set(recent.map((e) => e.promptId).filter((id): id is string => !!id))];
  }

  const pool = await prisma.journalPrompt.findMany({
    where: excludeIds.length ? { id: { notIn: excludeIds } } : undefined,
    select: { id: true },
  });

  const candidates =
    pool.length > 0 ? pool : await prisma.journalPrompt.findMany({ select: { id: true } });

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  return prisma.journalPrompt.findUnique({ where: { id: chosen.id } });
}
