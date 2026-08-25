import "server-only";
import { prisma } from "@/lib/db";
import { todayISO } from "@/lib/therapist-data";
import { pastCancelWindow } from "@/lib/cancel-window";
import type { RSVPStatus } from "@/generated/prisma/enums";

export type UpcomingSession = {
  id: string;
  /** Raw SessionBooking/BookingRequest id — pass this to cancelSessionBooking
   * / cancelBookingRequest, not `id` (which is the composite bell/read-
   * tracking key "session-<id>"/"request-<id>"). */
  bookingId: string;
  kind: "paid" | "request";
  counselorName: string;
  /** ISO "YYYY-MM-DD". */
  date: string;
  /** "HH:mm", 24-hour — omitted when only a day is known. */
  time?: string;
  /** Raw status ("PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" for a paid
   * session; "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" for a
   * request) — the page maps this to a localized label. */
  status: string;
  /** Where clicking this row should go — set only for actionable states
   * (e.g. finishing a pending payment). */
  href?: string;
  /** Client can cancel this from /upcoming: always true while pending
   * payment/confirmation, true for a confirmed booking only more than 24h
   * before the session, false once already cancelled/completed. */
  canCancel: boolean;
  read: boolean;
};

export type UpcomingEvent = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string | null;
  myRsvp: RSVPStatus | null;
  read: boolean;
};

function sessionCanCancel(status: string, date: string, time: string | null): boolean {
  if (status === "CANCELLED" || status === "COMPLETED") return false;
  if (status === "CONFIRMED") return !pastCancelWindow(date, time);
  return true;
}

async function getUpcomingSessions(email: string): Promise<UpcomingSession[]> {
  const today = todayISO();

  const [sessions, requests] = await Promise.all([
    prisma.sessionBooking.findMany({
      where: { email, preferredDate: { gte: today } },
      include: { counselor: true },
      orderBy: { preferredDate: "asc" },
    }),
    prisma.bookingRequest.findMany({
      where: { email, status: { not: "COMPLETED" }, preferredDate: { gte: today } },
      include: { counselor: true },
      orderBy: { preferredDate: "asc" },
    }),
  ]);

  const items: Omit<UpcomingSession, "read">[] = [
    ...sessions.map((s) => ({
      id: `session-${s.id}`,
      bookingId: s.id,
      kind: "paid" as const,
      counselorName: s.counselor.name,
      date: s.preferredDate,
      time: s.preferredTime ?? undefined,
      status: s.status,
      href: s.status === "PENDING_PAYMENT" ? `/counseling/session/${s.id}` : undefined,
      canCancel: sessionCanCancel(s.status, s.preferredDate, s.preferredTime),
    })),
    ...requests.map((r) => ({
      id: `request-${r.id}`,
      bookingId: r.id,
      kind: "request" as const,
      counselorName: r.counselor.name,
      date: r.preferredDate,
      time: r.preferredTime,
      status: r.status,
      canCancel: sessionCanCancel(r.status, r.preferredDate, r.preferredTime),
    })),
  ];

  items.sort((a, b) => (a.date === b.date ? (a.time ?? "").localeCompare(b.time ?? "") : a.date.localeCompare(b.date)));
  return items.map((i) => ({ ...i, read: false }));
}

async function getUpcomingEvents(userId: string): Promise<UpcomingEvent[]> {
  const today = todayISO();

  const events = await prisma.event.findMany({
    where: { startAt: { gte: new Date(`${today}T00:00:00`) } },
    include: { rsvps: { where: { userId } } },
    orderBy: { startAt: "asc" },
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    date: e.startAt.toISOString().slice(0, 10),
    time: e.startAt.toISOString().slice(11, 16),
    location: e.location,
    myRsvp: e.rsvps[0]?.status ?? null,
    read: false,
  }));
}

/** Full data for the /upcoming page: every upcoming counseling
 * session/request for this client (whatever its status) plus every
 * upcoming broadcast Event with this client's own RSVP, if any — each
 * flagged with whether this client has already opened it. */
export async function getUpcomingPageData(email: string, userId: string) {
  const [sessions, events] = await Promise.all([getUpcomingSessions(email), getUpcomingEvents(userId)]);

  const allIds = [...sessions.map((s) => s.id), ...events.map((e) => e.id)];
  const reads = allIds.length
    ? await prisma.notificationRead.findMany({
        where: { userId, itemId: { in: allIds } },
        select: { itemId: true, dismissed: true },
      })
    : [];
  const readIds = new Set(reads.map((r) => r.itemId));
  const dismissedIds = new Set(reads.filter((r) => r.dismissed).map((r) => r.itemId));

  return {
    sessions: sessions.filter((s) => !dismissedIds.has(s.id)).map((s) => ({ ...s, read: readIds.has(s.id) })),
    events: events.filter((e) => !dismissedIds.has(e.id)).map((e) => ({ ...e, read: readIds.has(e.id) })),
  };
}

/** Unread total — everything on /upcoming this client hasn't opened yet —
 * used to drive the header bell badge and the installed-app icon badge. */
export async function getUpcomingCount(email: string, userId: string): Promise<number> {
  const { sessions, events } = await getUpcomingPageData(email, userId);
  return sessions.filter((s) => !s.read).length + events.filter((e) => !e.read).length;
}
