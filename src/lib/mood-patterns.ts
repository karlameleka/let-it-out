import { prisma } from "@/lib/db";
import { MOODS, moodLabel } from "@/lib/moods";

export type MoodPatterns = {
  frequency: { emoji: string; label: string; count: number; percent: number }[];
  topMood: { emoji: string; label: string; count: number } | null;
  totalWithMood: number;
  /** Oldest first, aligned to full weeks (Sun–Sat) for a calendar-style grid. */
  heatmap: { date: string; mood: string | null }[];
};

const HEATMAP_WEEKS = 12;

export async function getMoodPatterns(userId: string): Promise<MoodPatterns> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - (HEATMAP_WEEKS * 7 - 1));
  start.setDate(start.getDate() - start.getDay()); // align back to Sunday

  const entries = await prisma.journalEntry.findMany({
    where: { userId, createdAt: { gte: start } },
    select: { mood: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Last mood recorded per day (for the one-cell-per-day heatmap), and a
  // separate count across every mood-tagged entry (for the breakdown —
  // multiple entries in one day should each still count there).
  const moodByDate = new Map<string, string>();
  const counts = new Map<string, number>();
  for (const e of entries) {
    if (!e.mood) continue;
    moodByDate.set(e.createdAt.toISOString().slice(0, 10), e.mood);
    counts.set(e.mood, (counts.get(e.mood) ?? 0) + 1);
  }
  const totalWithMood = [...counts.values()].reduce((a, b) => a + b, 0);

  const frequency = MOODS.map((m) => ({
    emoji: m.emoji,
    label: m.label,
    count: counts.get(m.emoji) ?? 0,
    percent: totalWithMood > 0 ? Math.round(((counts.get(m.emoji) ?? 0) / totalWithMood) * 100) : 0,
  }))
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count);

  const topMood = frequency[0]
    ? { emoji: frequency[0].emoji, label: frequency[0].label, count: frequency[0].count }
    : null;

  const heatmap: MoodPatterns["heatmap"] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10);
    heatmap.push({ date: key, mood: moodByDate.get(key) ?? null });
    cursor.setDate(cursor.getDate() + 1);
  }

  return { frequency, topMood, totalWithMood, heatmap };
}

export { moodLabel };
