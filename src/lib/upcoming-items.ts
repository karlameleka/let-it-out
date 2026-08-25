import "server-only";
import { prisma } from "@/lib/db";
import { todayISO } from "@/lib/therapist-data";
import type { RSVPStatus } from "@/generated/prisma/enums";

export type UpcomingSession = {
  id: string;
  kind: "paid" | "request";
  counselorName: string;
  /** ISO "YYYY-MM-DD". */
  date: string;
  /** "HH:mm", 24-hour — omitted when only a day is known. */
  time?: string;
  /** Raw status ("PENDING_PAYMENT" | "CONFIRMED" for a paid session;
   * "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" for a request) —
   * the page maps this to a localized label. */
  status: string;
  /** Where clicking this row should go — set only for actionable states
   * (e.g. finishing a pending payment). */
  href?: string;
};

export type UpcomingEvent = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string | null;
  myRsvp: RSVPStatus | null;
};

async function getUpcomingSessions(email: string): Promise<UpcomingSession[]> {
  const today = todayISO();

  const [sessions, requests] = await Promise.all([
    prisma.sessionBooking.findMany({
      where: { email, preferredDate: { gte: today } },
      include: { counselor: true },
      orderBy: { preferredDate: "asc" },
    }),
    prisma.bookingRequest.findMany({
      where: { email, status: { notIn: ["CANCELLED", "COMPLETED"] }, preferredDate: { gte: today } },
      include: { counselor: true },
      orderBy: { preferredDate: "asc" },
    }),
  ]);

  const items: UpcomingSession[] = [
    ...sessions.map((s) => ({
      id: `session-${s.id}`,
      kind: "paid" as const,
      counselorName: s.counselor.name,
      date: s.preferredDate,
      time: s.preferredTime ?? undefined,
      status: s.status,
      href: s.status === "PENDING_PAYMENT" ? `/counseling/session/${s.id}` : undefined,
    })),
    ...requests.map((r) => ({
      id: `request-${r.id}`,
      kind: "request" as const,
      counselorName: r.counselor.name,
      date: r.preferredDate,
      time: r.preferredTime,
      status: r.status,
    })),
  ];

  items.sort((a, b) => (a.date === b.date ? (a.time ?? "").localeCompare(b.time ?? "") : a.date.localeCompare(b.date)));
  return items;
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
  }));
}

/** Full data for the /upcoming page: every upcoming counseling
 * session/request for this client (whatever its status) plus every
 * upcoming broadcast Event with this client's own RSVP, if any. */
export async function getUpcomingPageData(email: string, userId: string) {
  const [sessions, events] = await Promise.all([getUpcomingSessions(email), getUpcomingEvents(userId)]);
  return { sessions, events };
}

/** Lightweight total — everything shown on /upcoming, counted — used to
 * drive the header bell badge and the installed-app icon badge. */
export async function getUpcomingCount(email: string, userId: string): Promise<number> {
  const { sessions, events } = await getUpcomingPageData(email, userId);
  return sessions.length + events.length;
}
