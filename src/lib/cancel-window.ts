const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

/** True once it's too late to cancel a *confirmed* session — less than 24h
 * before it. Like the rest of the app (see todayISO/availability.ts),
 * dates/times are plain Cairo-local values with no timezone conversion, so
 * this compares against the server clock directly via an explicit "Z" so
 * behavior doesn't depend on the server's configured timezone. When only a
 * day is known (no exact time — the counselor had no availability windows
 * configured), the whole day counts as the session, so the cutoff is the
 * start of that day. */
export function pastCancelWindow(date: string, time: string | null): boolean {
  const sessionMoment = new Date(`${date}T${time ?? "00:00"}:00Z`);
  const cutoff = new Date(sessionMoment.getTime() - CANCEL_WINDOW_MS);
  return new Date() > cutoff;
}
