/** Client-only streak tracking for the guided breathing exercise — kept
 * separate from the journal's and the CBT toolkit's streaks so completing
 * one doesn't inflate the others. Same day-set algorithm as the other two
 * for consistent "day streak" semantics across the app. */

const STREAK_KEY = "lio_breathing_streak_dates";

export type BreathingStreakStats = { streak: number; total: number };

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

function computeFromDays(days: Set<string>): BreathingStreakStats {
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

export function getBreathingStreak(): BreathingStreakStats {
  return computeFromDays(readDays());
}

/** Call once per completed session. Safe to call multiple times the same
 * day — only distinct days count toward the streak. */
export function recordBreathingCompletion(): BreathingStreakStats {
  const days = readDays();
  days.add(todayKey());
  window.localStorage.setItem(STREAK_KEY, JSON.stringify(Array.from(days)));
  return computeFromDays(days);
}
