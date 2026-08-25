import "server-only";
import { prisma } from "@/lib/db";

export const SESSION_MINUTES = 50;
const DAYS_AHEAD = 14;

export type AvailableSlot = { date: string; time: string };

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Slices a counselor's recurring weekly windows (CounselorAvailability)
 * into concrete 50-minute slots for the next two weeks, greedily packed
 * from each window's start time, excluding times already taken by a
 * non-cancelled BookingRequest or a SessionBooking. Returns [] for a
 * counselor with no windows set up yet — callers fall back to a free-text
 * request/day-only picker in that case. A counselor only ever uses one of
 * BookingRequest or SessionBooking depending on which flow applies to
 * them, but checking both is cheap and keeps this correct regardless of
 * how a counselor's config has changed over time.
 *
 * Like the rest of this app, dates/times are plain Cairo-local values with
 * no timezone conversion (see todayISO() in therapist-data.ts) — "now" is
 * whatever the server's clock says.
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
      where: { counselorId, preferredTime: { not: null } },
      select: { preferredDate: true, preferredTime: true },
    }),
  ]);
  const taken = new Set(
    [...bookingRequests, ...sessionBookings].map((b) => `${b.preferredDate}T${b.preferredTime}`),
  );

  const now = new Date();
  const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  const slots: AvailableSlot[] = [];
  for (let dayOffset = 0; dayOffset < DAYS_AHEAD; dayOffset++) {
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset));
    const dateStr = day.toISOString().slice(0, 10);
    const dayOfWeek = day.getUTCDay();

    for (const w of windows.filter((w) => w.dayOfWeek === dayOfWeek)) {
      const [startH, startM] = w.startTime.split(":").map(Number);
      const [endH, endM] = w.endTime.split(":").map(Number);
      const windowEnd = endH * 60 + endM;

      for (let cursor = startH * 60 + startM; cursor + SESSION_MINUTES <= windowEnd; cursor += SESSION_MINUTES) {
        if (dayOffset === 0 && cursor <= nowMinutes) continue;

        const timeStr = `${pad(Math.floor(cursor / 60))}:${pad(cursor % 60)}`;
        if (taken.has(`${dateStr}T${timeStr}`)) continue;

        slots.push({ date: dateStr, time: timeStr });
      }
    }
  }

  return slots.sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));
}
