import "server-only";
import { prisma } from "@/lib/db";
import { todayISO } from "@/lib/therapist-data";

export type UpcomingItem = {
  id: string;
  kind: "event" | "session";
  title: string;
  /** ISO "YYYY-MM-DD". */
  date: string;
  /** "HH:mm", 24-hour — omitted when only a day is known. */
  time?: string;
  location?: string;
};

/** Everything to show in a logged-in client's notification bell: every
 * upcoming admin-created Event (broadcast to all clients, no per-client
 * sign-up step) plus that client's own upcoming confirmed counseling
 * sessions, merged into one date-sorted list. */
export async function getUpcomingItemsForUser(email: string): Promise<UpcomingItem[]> {
  const today = todayISO();

  const [events, sessions, requests] = await Promise.all([
    prisma.event.findMany({
      where: { startAt: { gte: new Date(`${today}T00:00:00`) } },
      orderBy: { startAt: "asc" },
    }),
    prisma.sessionBooking.findMany({
      where: { email, status: "CONFIRMED", preferredDate: { gte: today } },
      include: { counselor: true },
      orderBy: { preferredDate: "asc" },
    }),
    prisma.bookingRequest.findMany({
      where: { email, status: "CONFIRMED", preferredDate: { gte: today } },
      include: { counselor: true },
      orderBy: { preferredDate: "asc" },
    }),
  ]);

  const items: UpcomingItem[] = [
    ...events.map((e) => ({
      id: `event-${e.id}`,
      kind: "event" as const,
      title: e.title,
      date: e.startAt.toISOString().slice(0, 10),
      time: e.startAt.toISOString().slice(11, 16),
      location: e.location ?? undefined,
    })),
    ...sessions.map((s) => ({
      id: `session-${s.id}`,
      kind: "session" as const,
      title: `Session with ${s.counselor.name}`,
      date: s.preferredDate,
      time: s.preferredTime ?? undefined,
    })),
    ...requests.map((r) => ({
      id: `request-${r.id}`,
      kind: "session" as const,
      title: `Session with ${r.counselor.name}`,
      date: r.preferredDate,
      time: r.preferredTime,
    })),
  ];

  items.sort((a, b) => (a.date === b.date ? (a.time ?? "").localeCompare(b.time ?? "") : a.date.localeCompare(b.date)));
  return items;
}
