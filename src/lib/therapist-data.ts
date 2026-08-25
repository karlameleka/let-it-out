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

// Narrower than TherapistCounselorWithBookings — deriveClients/deriveAppointments
// only ever touch these two fields, so anything with just this shape (e.g. a
// single client's filtered bookings) can reuse them without a full Counselor.
type BookingsSource = Pick<TherapistCounselorWithBookings, "sessionBookings" | "bookingRequests">;

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
export function deriveClients(counselor: BookingsSource): TherapistClient[] {
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
export function deriveAppointments(counselor: BookingsSource): TherapistAppointment[] {
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

export type IntakeAnswerEntry = { section: string; label: string; value: string };

/** Everything the therapist portal shows on one client: contact info +
 * booking history (scoped to just this client), every intake form they've
 * submitted to this counselor (most recent first), and this counselor's
 * private session notes for them (most recent first). Nothing here is
 * shared across counselors — every query is scoped by counselorId. */
export async function getClientProfile(counselorId: string, clientEmail: string) {
  const [sessionBookings, bookingRequests, intakeSubmissions, notes] = await Promise.all([
    prisma.sessionBooking.findMany({ where: { counselorId, email: clientEmail }, orderBy: { createdAt: "desc" } }),
    prisma.bookingRequest.findMany({ where: { counselorId, email: clientEmail }, orderBy: { createdAt: "desc" } }),
    prisma.intakeSubmission.findMany({ where: { counselorId, clientEmail }, orderBy: { submittedAt: "desc" } }),
    prisma.clientNote.findMany({ where: { counselorId, clientEmail }, orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }] }),
  ]);

  if (sessionBookings.length === 0 && bookingRequests.length === 0 && intakeSubmissions.length === 0 && notes.length === 0) {
    return null;
  }

  const allRows = [...sessionBookings, ...bookingRequests];
  const latest = allRows.reduce((a, b) => (b.createdAt > a.createdAt ? b : a), allRows[0]);

  return {
    name: latest?.name ?? intakeSubmissions[0]?.clientName ?? notes[0]?.clientName ?? clientEmail,
    email: clientEmail,
    phone: latest?.phone ?? null,
    appointments: deriveAppointments({ sessionBookings, bookingRequests }),
    intakeSubmissions,
    notes,
  };
}

export type TherapistClientProfile = NonNullable<Awaited<ReturnType<typeof getClientProfile>>>;
export type TherapistClientNote = TherapistClientProfile["notes"][number];
export type TherapistIntakeSubmission = TherapistClientProfile["intakeSubmissions"][number];

/** Every other therapist with portal access — the only people a referral
 * can actually reach, since receiving one only means anything if you can
 * log in and see it. */
export async function getOtherActiveCounselors(excludeCounselorId: string) {
  return prisma.counselor.findMany({
    where: { active: true, id: { not: excludeCounselorId }, passwordHash: { not: null } },
    select: { id: true, name: true, credentials: true, photoUrl: true },
    orderBy: { name: "asc" },
  });
}

export async function getReceivedReferrals(counselorId: string) {
  return prisma.referral.findMany({
    where: { toCounselorId: counselorId },
    include: { fromCounselor: { select: { name: true, photoUrl: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSentReferrals(counselorId: string) {
  return prisma.referral.findMany({
    where: { fromCounselorId: counselorId },
    include: { toCounselor: { select: { name: true, photoUrl: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export type ReferralNotesSnapshotEntry = {
  sessionDate: string;
  moods: string[];
  notes: string;
  nextSteps: string | null;
};

export type ReferralIntakeSnapshot = {
  answers: IntakeAnswerEntry[];
  aiSummary: string | null;
  submittedAt: string;
};

/** Everything this counselor has sent to one specific client — shown on
 * that client's profile page so the therapist can see what's already been
 * shared before sending more. Scoped by counselorId, same ownership
 * pattern as every other client-record query in this file. */
export async function getAssignedResourcesForClient(counselorId: string, clientEmail: string) {
  return prisma.assignedResource.findMany({
    where: { counselorId, clientEmail },
    orderBy: { createdAt: "desc" },
  });
}
