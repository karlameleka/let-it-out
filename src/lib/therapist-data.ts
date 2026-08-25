import "server-only";
import { prisma } from "@/lib/db";

export async function getOwnCounselorWithBookings(counselorId: string) {
  return prisma.counselor.findUnique({
    where: { id: counselorId },
    include: {
      sessionBookings: { orderBy: { createdAt: "desc" } },
      bookingRequests: { orderBy: { createdAt: "desc" } },
    },
  });
}

export type TherapistCounselorWithBookings = NonNullable<
  Awaited<ReturnType<typeof getOwnCounselorWithBookings>>
>;

export type TherapistClient = {
  name: string;
  email: string;
  phone: string;
  lastContact: Date;
  totalBookings: number;
};

/** One row per distinct client email, merged across both the paid
 * pre-booking flow and the manual booking-request flow — the same shape
 * as the admin counselor-detail "Clients" list, scoped here to a single
 * counselor's own records. */
export function deriveClients(counselor: TherapistCounselorWithBookings): TherapistClient[] {
  const byEmail = new Map<string, TherapistClient>();
  for (const row of [...counselor.sessionBookings, ...counselor.bookingRequests]) {
    const existing = byEmail.get(row.email);
    if (existing) {
      existing.totalBookings += 1;
      if (row.createdAt > existing.lastContact) {
        existing.lastContact = row.createdAt;
        existing.name = row.name;
        existing.phone = row.phone;
      }
    } else {
      byEmail.set(row.email, {
        name: row.name,
        email: row.email,
        phone: row.phone,
        lastContact: row.createdAt,
        totalBookings: 1,
      });
    }
  }
  return [...byEmail.values()].sort((a, b) => b.lastContact.getTime() - a.lastContact.getTime());
}

export type TherapistAppointment = {
  id: string;
  kind: "Paid session" | "Session request";
  name: string;
  email: string;
  phone: string;
  /** ISO "YYYY-MM-DD" — visitor-picked preferred date, entered via a plain
   * date input, not a confirmed exact time slot (that lives in Cal.com). */
  date: string;
  time?: string;
  status: string;
  createdAt: Date;
};

/** Every booking (paid + manual request) as one flat, chronologically
 * sorted agenda — this is the closest thing to "the calendar" this app
 * owns; exact time slots are Cal.com's, not ours. */
export function deriveAppointments(counselor: TherapistCounselorWithBookings): TherapistAppointment[] {
  const paid: TherapistAppointment[] = counselor.sessionBookings.map((b) => ({
    id: b.id,
    kind: "Paid session",
    name: b.name,
    email: b.email,
    phone: b.phone,
    date: b.preferredDate,
    status: b.status,
    createdAt: b.createdAt,
  }));
  const requests: TherapistAppointment[] = counselor.bookingRequests.map((b) => ({
    id: b.id,
    kind: "Session request",
    name: b.name,
    email: b.email,
    phone: b.phone,
    date: b.preferredDate,
    time: b.preferredTime,
    status: b.status,
    createdAt: b.createdAt,
  }));
  return [...paid, ...requests].sort((a, b) => a.date.localeCompare(b.date));
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
