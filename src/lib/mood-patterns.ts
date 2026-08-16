import { prisma } from "@/lib/db";
import { MOODS, moodLabel, moodColor } from "@/lib/moods";

export type MoodPatterns = {
  frequency: { id: string; label: string; color: string; count: number; percent: number }[];
  topMood: { id: string; label: string; color: string; count: number } | null;
  totalWithMood: number;
  /** Oldest first, aligned to full weeks (Sun–Sat) for a calendar-style grid.
   * `moods` holds every mood-tagged entry from that day, in order — a day
   * with several entries shows every one of their colors, not just the
   * last one written. */
  heatmap: { date: string; moods: string[] }[];
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

  // Every mood-tagged entry, grouped by day (so a day with several entries
  // shows every one of their colors), and a separate count across every
  // mood-tagged entry (for the breakdown).
  const moodsByDate = new Map<string, string[]>();
  const counts = new Map<string, number>();
  for (const e of entries) {
    if (!e.mood) continue;
    const key = e.createdAt.toISOString().slice(0, 10);
    const existing = moodsByDate.get(key);
    if (existing) existing.push(e.mood);
    else moodsByDate.set(key, [e.mood]);
    counts.set(e.mood, (counts.get(e.mood) ?? 0) + 1);
  }
  const totalWithMood = [...counts.values()].reduce((a, b) => a + b, 0);

  const frequency = MOODS.map((m) => ({
    id: m.id,
    label: m.label,
    color: m.color,
    count: counts.get(m.id) ?? 0,
    percent: totalWithMood > 0 ? Math.round(((counts.get(m.id) ?? 0) / totalWithMood) * 100) : 0,
  }))
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count);

  const topMood = frequency[0]
    ? { id: frequency[0].id, label: frequency[0].label, color: frequency[0].color, count: frequency[0].count }
    : null;

  const heatmap: MoodPatterns["heatmap"] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const key = cursor.toISOString().slice(0, 10);
    heatmap.push({ date: key, moods: moodsByDate.get(key) ?? [] });
    cursor.setDate(cursor.getDate() + 1);
  }

  return { frequency, topMood, totalWithMood, heatmap };
}

export { moodLabel, moodColor };
