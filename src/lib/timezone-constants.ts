/** Plain constants and pure timezone math — no "server-only" guard and no
 * next/headers dependency, so both server code (src/lib/timezone.ts
 * re-exports all of this) and client components can import this file
 * directly. Split out from timezone.ts specifically so a client component
 * reached from the admin dashboard (e.g. date-range-picker.tsx) can use
 * Cairo-anchored date math without pulling in getUserTimeZone(), the one
 * function here that genuinely needs next/headers' cookies(). */

/** This pilot's counselors and almost all of its visitors are in Egypt, so
 * this doubles as (a) the canonical timezone the booking calendar itself
 * runs on — a counselor's availability windows and a booked session's
 * date/time are Cairo-local values regardless of who's looking at them,
 * exactly like a real-world appointment book — (b) the fallback used by
 * getUserTimeZone() before a visitor's own device timezone is known, and
 * (c) the fixed timezone the admin dashboard and therapist portal always
 * display in, deliberately not tied to whichever device happens to be
 * viewing them. */
export const CAIRO_TIME_ZONE = "Africa/Cairo";

/** Set client-side by <TimezoneCookieSync> (src/components/timezone-cookie-sync.tsx)
 * from `Intl.DateTimeFormat().resolvedOptions().timeZone` — the visitor's
 * actual device timezone. Kept in sync with the literal "lio_tz" string used
 * there, since that file can't import next/headers-dependent code. */
export const TIMEZONE_COOKIE = "lio_tz";

type ZonedParts = { dateStr: string; hour: number; minute: number };

/** Breaks an instant down into the wall-clock date/time it reads as on a
 * clock in `timeZone` — e.g. 22:30 UTC on Jan 1st reads as "Jan 2nd, 00:30"
 * in Cairo (UTC+2). This is the one primitive everything else here builds
 * on, and is exact (ICU-backed via Intl, not a hand-rolled offset table). */
export function zonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  // Some ICU versions render midnight as hour "24" under hour12: false.
  const hour = Number(get("hour")) % 24;
  return { dateStr: `${get("year")}-${get("month")}-${get("day")}`, hour, minute: Number(get("minute")) };
}

/** Today's date (YYYY-MM-DD) as it currently reads on a clock in `timeZone`
 * — what "today" should mean everywhere a calendar day boundary matters
 * (booking, cutoffs, cron jobs), instead of the server's own UTC day. */
export function todayInTimeZone(timeZone: string, now: Date = new Date()): string {
  return zonedParts(now, timeZone).dateStr;
}

/** Minutes since local midnight in `timeZone`, for lead-time/cutoff math. */
export function minutesSinceMidnightInTimeZone(timeZone: string, now: Date = new Date()): number {
  const { hour, minute } = zonedParts(now, timeZone);
  return hour * 60 + minute;
}

/** Adds `days` to a YYYY-MM-DD date string. Deliberately takes no timezone —
 * once you have a calendar date, moving it forward/back a number of days
 * means the same thing everywhere, so this is pure integer arithmetic. */
export function addDaysToDateStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/**
 * Converts a wall-clock date + time, as read on a clock in `timeZone`, to
 * the absolute instant it refers to — e.g. "when does a session booked for
 * 2026-09-26 14:00 Cairo time actually start", needed for any cutoff
 * (cancel window, lead time) that compares against Date.now().
 *
 * Implemented as a single-correction pass against Intl's own instant→zoned
 * conversion (zonedParts above): guess the instant is UTC, see what
 * wall-clock time that guess actually reads as in `timeZone`, and shift by
 * the difference. This is the same technique date-fns-tz/Luxon use
 * internally, and is exact outside the one-hour window of a DST transition
 * (Egypt currently observes none, so this is exact for Cairo).
 */
export function zonedTimeToUtc(dateStr: string, timeStr: string, timeZone: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const asZoned = zonedParts(new Date(guess), timeZone);
  const [zy, zm, zd] = asZoned.dateStr.split("-").map(Number);
  const zonedAsUtc = Date.UTC(zy, zm - 1, zd, asZoned.hour, asZoned.minute);
  const offsetMs = zonedAsUtc - guess;
  return new Date(guess - offsetMs);
}
