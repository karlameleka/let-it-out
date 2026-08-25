/** Client-only streak tracking for the guided breathing exercise — kept
 * separate from the journal's and the CBT toolkit's streaks so completing
 * one doesn't inflate the others. Same day-set algorithm as the other two
 * for consistent "day streak" semantics across the app. */

const STREAK_KEY = "lio_breathing_streak_dates";
const TOTAL_SECONDS_KEY = "lio_breathing_total_seconds";

export type BreathingStreakStats = { streak: number; total: number; totalMinutes: number };

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

function readTotalSeconds(): number {
  const raw = window.localStorage.getItem(TOTAL_SECONDS_KEY);
  const seconds = Number(raw ?? "0");
  return Number.isFinite(seconds) ? seconds : 0;
}

function computeFromDays(days: Set<string>, totalSeconds: number): BreathingStreakStats {
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { streak, total: days.size, totalMinutes: Math.round(totalSeconds / 60) };
}

export function getBreathingStreak(): BreathingStreakStats {
  return computeFromDays(readDays(), readTotalSeconds());
}

/** Call once per completed session, with how long the paced session ran
 * (sum of every phase's seconds across all completed cycles). Safe to call
 * multiple times the same day — only distinct days count toward the streak,
 * but every session's duration adds to the running total. */
export function recordBreathingCompletion(durationSeconds: number): BreathingStreakStats {
  const days = readDays();
  days.add(todayKey());
  window.localStorage.setItem(STREAK_KEY, JSON.stringify(Array.from(days)));

  const totalSeconds = readTotalSeconds() + durationSeconds;
  window.localStorage.setItem(TOTAL_SECONDS_KEY, String(totalSeconds));

  return computeFromDays(days, totalSeconds);
}
