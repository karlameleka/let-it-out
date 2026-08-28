import "server-only";
import { prisma } from "@/lib/db";
import { todayISO } from "@/lib/therapist-data";
import { pastCancelWindow } from "@/lib/cancel-window";
import type { RSVPStatus } from "@/generated/prisma/enums";
import type { Locale } from "@/lib/i18n/locale";

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
  /** Video-call link the counselor posted from their portal — set only
   * once a session is confirmed. */
  meetingLink: string | null;
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
  /** Online session link the admin posted at creation — only meaningful
   * (and only ever shown) once this client's RSVP is ATTENDING. */
  meetingLink: string | null;
};

export type UpcomingReflection = {
  /** Composite bell/read-tracking key ("reflection-<ReflectionPrompt.id>"). */
  id: string;
  createdAt: string;
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
      meetingLink: s.meetingLink,
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
      meetingLink: r.meetingLink,
    })),
  ];

  items.sort((a, b) => (a.date === b.date ? (a.time ?? "").localeCompare(b.time ?? "") : a.date.localeCompare(b.date)));
  return items.map((i) => ({ ...i, read: false }));
}

async function getUpcomingEvents(userId: string, locale: Locale): Promise<UpcomingEvent[]> {
  const today = todayISO();

  const events = await prisma.event.findMany({
    where: { startAt: { gte: new Date(`${today}T00:00:00`) } },
    include: { rsvps: { where: { userId } } },
    orderBy: { startAt: "asc" },
  });

  return events.map((e) => {
    const myRsvp = e.rsvps[0]?.status ?? null;
    return {
      id: e.id,
      title: locale === "ar" && e.titleAr ? e.titleAr : e.title,
      description: locale === "ar" && e.descriptionAr ? e.descriptionAr : e.description,
      date: e.startAt.toISOString().slice(0, 10),
      time: e.startAt.toISOString().slice(11, 16),
      location: e.location,
      myRsvp,
      read: false,
      // Only surfaced to clients who've RSVP'd attending — never leaked to
      // a "maybe"/"not attending"/no-response client via this data layer.
      meetingLink: myRsvp === "ATTENDING" ? e.meetingLink : null,
    };
  });
}

async function getUpcomingReflections(userId: string): Promise<UpcomingReflection[]> {
  const prompts = await prisma.reflectionPrompt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true },
  });
  return prompts.map((p) => ({ id: `reflection-${p.id}`, createdAt: p.createdAt.toISOString(), read: false }));
}

/** Full data for the /upcoming page: every upcoming counseling
 * session/request for this client (whatever its status), every upcoming
 * broadcast Event with this client's own RSVP, if any, and every pending
 * "fill out your reflection sheet" prompt — each flagged with whether this
 * client has already opened it. */
export async function getUpcomingPageData(email: string, userId: string, locale: Locale = "en") {
  const [sessions, events, reflections] = await Promise.all([
    getUpcomingSessions(email),
    getUpcomingEvents(userId, locale),
    getUpcomingReflections(userId),
  ]);

  const allIds = [...sessions.map((s) => s.id), ...events.map((e) => e.id), ...reflections.map((r) => r.id)];
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
    reflections: reflections.filter((r) => !dismissedIds.has(r.id)).map((r) => ({ ...r, read: readIds.has(r.id) })),
  };
}

/** Unread total — everything on /upcoming this client hasn't opened yet —
 * used to drive the header bell badge and the installed-app icon badge. */
export async function getUpcomingCount(email: string, userId: string): Promise<number> {
  const { sessions, events, reflections } = await getUpcomingPageData(email, userId);
  return (
    sessions.filter((s) => !s.read).length +
    events.filter((e) => !e.read).length +
    reflections.filter((r) => !r.read).length
  );
}

export type PastSession = {
  /** Composite bell/dismiss-tracking key — same "session-<id>"/"request-<id>"
   * scheme as UpcomingSession, safely reused since a booking's date having
   * passed already removes it from the live /upcoming query above. */
  id: string;
  bookingId: string;
  kind: "paid" | "request";
  counselorName: string;
  date: string;
  time?: string | null;
};

export type PastEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string | null;
};

/** Attended history for the /upcoming/past subpage: counseling sessions
 * that actually happened (confirmed, not cancelled, date already past) and
 * workshops the client RSVP'd ATTENDING to that have already happened —
 * never sessions/events that were cancelled, missed, or never RSVP'd to. */
export async function getPastItems(email: string, userId: string, locale: Locale = "en") {
  const today = todayISO();

  const [sessions, requests, events] = await Promise.all([
    prisma.sessionBooking.findMany({
      where: { email, status: "CONFIRMED", preferredDate: { lt: today } },
      include: { counselor: true },
      orderBy: { preferredDate: "desc" },
    }),
    prisma.bookingRequest.findMany({
      where: { email, status: { in: ["CONFIRMED", "COMPLETED"] }, preferredDate: { lt: today } },
      include: { counselor: true },
      orderBy: { preferredDate: "desc" },
    }),
    prisma.event.findMany({
      where: { startAt: { lt: new Date(`${today}T00:00:00`) } },
      include: { rsvps: { where: { userId, status: "ATTENDING" } } },
      orderBy: { startAt: "desc" },
    }),
  ]);

  const pastSessions: PastSession[] = [
    ...sessions.map((s) => ({
      id: `session-${s.id}`,
      bookingId: s.id,
      kind: "paid" as const,
      counselorName: s.counselor.name,
      date: s.preferredDate,
      time: s.preferredTime,
    })),
    ...requests.map((r) => ({
      id: `request-${r.id}`,
      bookingId: r.id,
      kind: "request" as const,
      counselorName: r.counselor.name,
      date: r.preferredDate,
      time: r.preferredTime,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const pastEvents: PastEvent[] = events
    .filter((e) => e.rsvps.length > 0)
    .map((e) => ({
      id: e.id,
      title: locale === "ar" && e.titleAr ? e.titleAr : e.title,
      date: e.startAt.toISOString().slice(0, 10),
      time: e.startAt.toISOString().slice(11, 16),
      location: e.location,
    }));

  const allIds = [...pastSessions.map((s) => s.id), ...pastEvents.map((e) => e.id)];
  const dismissed = allIds.length
    ? await prisma.notificationRead.findMany({
        where: { userId, itemId: { in: allIds }, dismissed: true },
        select: { itemId: true },
      })
    : [];
  const dismissedIds = new Set(dismissed.map((d) => d.itemId));

  return {
    sessions: pastSessions.filter((s) => !dismissedIds.has(s.id)),
    events: pastEvents.filter((e) => !dismissedIds.has(e.id)),
  };
}
