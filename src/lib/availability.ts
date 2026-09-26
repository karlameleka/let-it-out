import "server-only";
import { prisma } from "@/lib/db";
import { CAIRO_TIME_ZONE, zonedParts } from "@/lib/timezone";

export const SESSION_MINUTES = 50;
// Covers the farthest-out one-off date window a therapist can open (see
// MAX_DATE_DAYS_AHEAD in therapist-availability-actions.ts) so a slot
// opened for the last day of that range still gets sliced out below.
const DAYS_AHEAD = 31;

export type AvailableSlot = { date: string; time: string };

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Slots need at least this much lead time to show up as bookable — also
 * means "today" never has any slots on offer, since every same-day time is
 * necessarily under 24 hours out. */
const MIN_LEAD_MINUTES = 24 * 60;

/**
 * Slices a counselor's availability windows (CounselorAvailability) —
 * recurring weekly windows (dayOfWeek set) and one-off single-date windows
 * (date set) alike — into concrete 50-minute slots for the next month,
 * greedily packed from each window's start time, excluding times already
 * taken by a non-cancelled BookingRequest or a SessionBooking, and anything
 * under MIN_LEAD_MINUTES away. Returns [] for a counselor with no windows
 * set up yet — callers fall back to a free-text request/day-only picker in
 * that case. A counselor only ever uses one of BookingRequest or
 * SessionBooking depending on which flow applies to them, but checking
 * both is cheap and keeps this correct regardless of how a counselor's
 * config has changed over time.
 *
 * Like the rest of this app, dates/times are plain Cairo-local values with
 * no further timezone conversion (see todayISO() in therapist-data.ts) —
 * "now" is read via CAIRO_TIME_ZONE (src/lib/timezone.ts), not the server's
 * own clock, since Vercel runs the server in UTC and Cairo is 2-3 hours
 * ahead of it.
 */
export async function getAvailableSlots(counselorId: string): Promise<AvailableSlot[]> {
  const windows = await prisma.counselorAvailability.findMany({ where: { counselorId } });
  if (windows.length === 0) return [];

  const [bookingRequests, sessionBookings] = await Promise.all([
    prisma.bookingRequest.findMany({
      where: { counselorId, status: { not: "CANCELLED" } },
      select: { preferredDate: true, preferredTime: true },
    }),
    prisma.sessionBooking.findMany({
      where: { counselorId, preferredTime: { not: null }, status: { not: "CANCELLED" } },
      select: { preferredDate: true, preferredTime: true },
    }),
  ]);
  const taken = new Set(
    [...bookingRequests, ...sessionBookings].map((b) => `${b.preferredDate}T${b.preferredTime}`),
  );

  const now = zonedParts(new Date(), CAIRO_TIME_ZONE);
  const nowMinutes = now.hour * 60 + now.minute;
  const [todayYear, todayMonth, todayDay] = now.dateStr.split("-").map(Number);

  const slots: AvailableSlot[] = [];
  for (let dayOffset = 0; dayOffset < DAYS_AHEAD; dayOffset++) {
    // Pure calendar-day arithmetic on Cairo's own Y-M-D triple — Date.UTC is
    // just a neutral integer-math space here, not a timezone conversion.
    const day = new Date(Date.UTC(todayYear, todayMonth - 1, todayDay + dayOffset));
    const dateStr = day.toISOString().slice(0, 10);
    const dayOfWeek = day.getUTCDay();

    const dayWindows = windows.filter((w) => w.date === dateStr || (w.date === null && w.dayOfWeek === dayOfWeek));
    for (const w of dayWindows) {
      const [startH, startM] = w.startTime.split(":").map(Number);
      const [endH, endM] = w.endTime.split(":").map(Number);
      const windowEnd = endH * 60 + endM;

      for (let cursor = startH * 60 + startM; cursor + SESSION_MINUTES <= windowEnd; cursor += SESSION_MINUTES) {
        if (dayOffset * 24 * 60 + cursor - nowMinutes < MIN_LEAD_MINUTES) continue;

        const timeStr = `${pad(Math.floor(cursor / 60))}:${pad(cursor % 60)}`;
        if (taken.has(`${dateStr}T${timeStr}`)) continue;

        slots.push({ date: dateStr, time: timeStr });
      }
    }
  }

  return slots.sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));
}
