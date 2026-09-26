import "server-only";
import { prisma } from "@/lib/db";
import { CAIRO_TIME_ZONE, addDaysToDateStr, todayInTimeZone } from "@/lib/timezone";

export async function getOwnCounselorWithBookings(counselorId: string) {
  // manualClients is fetched separately, as its own top-level query, not a
  // nested `include` — the field-encryption extension (see
  // prisma-field-encryption-extension.ts) only decrypts the model a query
  // is issued directly against; a relation pulled in via `include` would
  // come back with referralSource still ciphertext.
  const [counselor, manualClients] = await Promise.all([
    prisma.counselor.findUnique({
      where: { id: counselorId },
      include: {
        sessionBookings: { orderBy: { createdAt: "desc" } },
        bookingRequests: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.manualClient.findMany({ where: { counselorId }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!counselor) return null;
  return { ...counselor, manualClients };
}

export type TherapistCounselorWithBookings = NonNullable<
  Awaited<ReturnType<typeof getOwnCounselorWithBookings>>
>;

// Narrower than TherapistCounselorWithBookings — deriveClients/deriveAppointments
// only ever touch these fields, so anything with just this shape (e.g. a
// single client's filtered bookings) can reuse them without a full Counselor.
type BookingsSource = Pick<TherapistCounselorWithBookings, "sessionBookings" | "bookingRequests"> & {
  manualClients?: TherapistCounselorWithBookings["manualClients"];
};

export type TherapistClient = {
  name: string;
  email: string;
  phone: string;
  lastContact: Date;
  totalBookings: number;
  /** Free text, "how did this client hear about us" — set only by a
   * manually-added ManualClient row; null for anyone who has only ever
   * come in through a booking. */
  referralSource: string | null;
};

/** One row per distinct client email, merged across the paid pre-booking
 * flow, the manual booking-request flow, and any hand-added ManualClient
 * records (someone referred in person who hasn't booked yet) — the same
 * shape as the admin counselor-detail "Clients" list, scoped here to a
 * single counselor's own records. A ManualClient row is seeded first so a
 * client with zero bookings still shows up; if bookings exist too, they
 * take over name/phone/lastContact (freshest wins) but referralSource
 * carries through either way. */
export function deriveClients(counselor: BookingsSource): TherapistClient[] {
  const byEmail = new Map<string, TherapistClient>();
  for (const m of counselor.manualClients ?? []) {
    byEmail.set(m.clientEmail, {
      name: m.name,
      email: m.clientEmail,
      phone: m.phone ?? "",
      lastContact: m.createdAt,
      totalBookings: 0,
      referralSource: m.referralSource,
    });
  }
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
        referralSource: null,
      });
    }
  }
  return [...byEmail.values()].sort((a, b) => b.lastContact.getTime() - a.lastContact.getTime());
}

export type TherapistAppointment = {
  id: string;
  kind: "Paid session" | "Session request";
  /** Which table this id belongs to — pass to setMeetingLink so it knows
   * SessionBooking vs BookingRequest. */
  bookingKind: "paid" | "request";
  name: string;
  email: string;
  phone: string;
  /** ISO "YYYY-MM-DD" — visitor-picked preferred date. */
  date: string;
  time?: string;
  status: string;
  meetingLink: string | null;
  createdAt: Date;
};

/** Every booking (paid + manual request) as one flat, chronologically
 * sorted agenda — the closest thing to "the calendar" this app owns. */
export function deriveAppointments(counselor: BookingsSource): TherapistAppointment[] {
  const paid: TherapistAppointment[] = counselor.sessionBookings.map((b) => ({
    id: b.id,
    kind: "Paid session",
    bookingKind: "paid",
    name: b.name,
    email: b.email,
    phone: b.phone,
    date: b.preferredDate,
    time: b.preferredTime ?? undefined,
    status: b.status,
    meetingLink: b.meetingLink,
    createdAt: b.createdAt,
  }));
  const requests: TherapistAppointment[] = counselor.bookingRequests.map((b) => ({
    id: b.id,
    kind: "Session request",
    bookingKind: "request",
    name: b.name,
    email: b.email,
    phone: b.phone,
    date: b.preferredDate,
    time: b.preferredTime,
    status: b.status,
    meetingLink: b.meetingLink,
    createdAt: b.createdAt,
  }));
  return [...paid, ...requests].sort((a, b) => a.date.localeCompare(b.date));
}

/** "Today" on the booking calendar's own clock (Cairo) — not the server's,
 * since Vercel runs in UTC and Cairo is 2-3 hours ahead of it. */
export function todayISO(): string {
  return todayInTimeZone(CAIRO_TIME_ZONE);
}

/** Tomorrow's date as "YYYY-MM-DD" — used by the session-reminders cron to
 * find bookings happening the day after it runs. */
export function tomorrowISO(): string {
  return addDaysToDateStr(todayISO(), 1);
}

export type IntakeAnswerEntry = { section: string; label: string; value: string };

/** Everything the therapist portal shows on one client: contact info +
 * booking history (scoped to just this client), every intake form they've
 * submitted to this counselor (most recent first), and this counselor's
 * private session notes for them (most recent first). Nothing here is
 * shared across counselors — every query is scoped by counselorId. */
export async function getClientProfile(counselorId: string, clientEmail: string) {
  const [sessionBookings, bookingRequests, intakeSubmissions, notes, medications, manualClient] = await Promise.all([
    prisma.sessionBooking.findMany({ where: { counselorId, email: clientEmail }, orderBy: { createdAt: "desc" } }),
    prisma.bookingRequest.findMany({ where: { counselorId, email: clientEmail }, orderBy: { createdAt: "desc" } }),
    prisma.intakeSubmission.findMany({ where: { counselorId, clientEmail }, orderBy: { submittedAt: "desc" } }),
    prisma.clientNote.findMany({ where: { counselorId, clientEmail }, orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }] }),
    // Unlike notes (private to the counselor who wrote them), medications
    // are shared across every counselor treating this client — not scoped
    // to counselorId — since knowing what a client is prescribed matters
    // for their safety regardless of who prescribed it.
    prisma.medication.findMany({
      where: { clientEmail },
      include: { counselor: { select: { name: true } } },
      orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    }),
    // A manually-added client (see ManualClient/addManualClient) has none
    // of the rows above until they actually book — without this, this
    // function would return null and 404 for a client who was hand-added
    // but hasn't come in for a session yet.
    prisma.manualClient.findUnique({ where: { counselorId_clientEmail: { counselorId, clientEmail } } }),
  ]);

  if (
    sessionBookings.length === 0 &&
    bookingRequests.length === 0 &&
    intakeSubmissions.length === 0 &&
    notes.length === 0 &&
    medications.length === 0 &&
    !manualClient
  ) {
    return null;
  }

  const allRows = [...sessionBookings, ...bookingRequests];
  const latest = allRows.reduce((a, b) => (b.createdAt > a.createdAt ? b : a), allRows[0]);

  return {
    name:
      latest?.name ??
      manualClient?.name ??
      intakeSubmissions[0]?.clientName ??
      notes[0]?.clientName ??
      medications[0]?.clientName ??
      clientEmail,
    email: clientEmail,
    phone: latest?.phone ?? manualClient?.phone ?? null,
    referralSource: manualClient?.referralSource ?? null,
    appointments: deriveAppointments({ sessionBookings, bookingRequests }),
    intakeSubmissions,
    notes,
    medications,
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
