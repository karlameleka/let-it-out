/**
 * Client-side-only day-key helpers. "Local" here means the browser's own
 * device timezone — call these ONLY from client components/IndexedDB code
 * (journal/mood/CBT/breathing history, all of which already live entirely
 * in the browser). On the server, `new Date()` reads the server's own clock
 * (UTC on Vercel), which is not what "local" means here — server code that
 * needs a timezone-aware "today" should use src/lib/timezone.ts instead.
 *
 * Every entry in this app stores `createdAt` as a full UTC ISO timestamp
 * (`new Date().toISOString()`), which is correct as an absolute instant.
 * The bug this file exists to prevent is bucketing that instant into a
 * calendar day via `.slice(0, 10)`, which extracts the *UTC* date — for a
 * visitor ahead of UTC (e.g. Cairo, UTC+2/+3), that's the wrong day for
 * roughly the first 2-3 hours after their local midnight, right when
 * "did I do this today" matters most for a streak.
 */

/** YYYY-MM-DD for `date`, using its LOCAL (not UTC) calendar day. */
export function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** YYYY-MM-DD for the local calendar day a stored UTC ISO timestamp falls
 * on — the correct replacement for `isoTimestamp.slice(0, 10)`. */
export function localDayKeyFromIso(isoTimestamp: string): string {
  return localDayKey(new Date(isoTimestamp));
}

/** Today's date as YYYY-MM-DD, in the browser's own local timezone. */
export function todayLocalDayKey(): string {
  return localDayKey(new Date());
}
