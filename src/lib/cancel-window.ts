import { CAIRO_TIME_ZONE, zonedTimeToUtc } from "@/lib/timezone";

const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

/** True once it's too late to cancel a *confirmed* session — less than 24h
 * before it. Like the rest of the app (see todayISO/availability.ts),
 * dates/times are plain Cairo-local values, so they're converted to an
 * absolute instant via zonedTimeToUtc(..., CAIRO_TIME_ZONE) before comparing
 * against "now" — appending a bare "Z" (treating the Cairo wall-clock value
 * as if it were already UTC) used to shift every cutoff by Cairo's 2-3 hour
 * offset. When only a day is known (no exact time — the counselor had no
 * availability windows configured), the whole day counts as the session, so
 * the cutoff is the start of that day. */
export function pastCancelWindow(date: string, time: string | null): boolean {
  const sessionMoment = zonedTimeToUtc(date, time ?? "00:00", CAIRO_TIME_ZONE);
  const cutoff = new Date(sessionMoment.getTime() - CANCEL_WINDOW_MS);
  return new Date() > cutoff;
}
