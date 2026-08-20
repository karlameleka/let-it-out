/** Client-only streak tracking for the CBT exercises (grounding, reframing,
 * etc.) — a separate localStorage-backed streak from the journal's, so
 * finishing a CBT exercise doesn't inflate the journaling streak and vice
 * versa. Mirrors the journal's day-set streak algorithm in local-journal.ts
 * for consistent "day streak" semantics across the app. */

const STREAK_KEY = "lio_cbt_streak_dates";

export type CbtStreakStats = { streak: number; total: number };

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readDays(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STREAK_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function computeFromDays(days: Set<string>): CbtStreakStats {
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { streak, total: days.size };
}

export function getCbtStreak(): CbtStreakStats {
  return computeFromDays(readDays());
}

/** Call once per completed exercise. Safe to call multiple times the same
 * day — only distinct days count toward the streak. */
export function recordCbtCompletion(): CbtStreakStats {
  const days = readDays();
  days.add(todayKey());
  window.localStorage.setItem(STREAK_KEY, JSON.stringify(Array.from(days)));
  return computeFromDays(days);
}
