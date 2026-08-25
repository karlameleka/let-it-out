"use server";

import { prisma } from "@/lib/db";
import { requireCounselor } from "@/lib/therapist-session";
import { revalidatePath } from "next/cache";
import { CLIENT_TOOLS, MAX_TOOLKIT_PDF_BYTES } from "@/lib/therapist-toolkit";
import { getBaseUrl } from "@/lib/base-url";
import { sendReferralNotificationEmail, sendAssignedResourceNotificationEmail } from "@/lib/email";
import type { ReferralIntakeSnapshot, ReferralNotesSnapshotEntry } from "@/lib/therapist-data";

export type TherapistProfileFormState = { error?: string; success?: boolean } | undefined;

export async function updateTherapistProfile(
  _prevState: TherapistProfileFormState,
  formData: FormData,
): Promise<TherapistProfileFormState> {
  const session = await requireCounselor().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const credentials = String(formData.get("credentials") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const specialties = String(formData.get("specialties") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const languages = String(formData.get("languages") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const photoUrlRaw = String(formData.get("photoUrl") ?? "").trim();

  if (!credentials || !bio) return { error: "Credentials and bio can't be empty." };
  if (!email) return { error: "Please enter a notification email." };

  // Own row only — counselorId always comes from the verified session, never
  // from the form, so one therapist can't edit another's profile by
  // tampering with a hidden field.
  await prisma.counselor.update({
    where: { id: session.counselorId },
    data: {
      credentials,
      bio,
      email,
      specialties,
      languages,
      ...(photoUrlRaw ? { photoUrl: photoUrlRaw } : {}),
    },
  });

  revalidatePath("/therapist/profile");
  revalidatePath("/counseling");
  revalidatePath("/counseling/[slug]", "page");
  revalidatePath("/");
  return { success: true };
}

const AVAILABILITY_VALUES = ["AVAILABLE", "WAITLIST", "UNAVAILABLE"] as const;

export type TherapistPricingFormState = { error?: string; success?: boolean } | undefined;

export async function updateTherapistPricing(
  _prevState: TherapistPricingFormState,
  formData: FormData,
): Promise<TherapistPricingFormState> {
  const session = await requireCounselor().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const priceRaw = String(formData.get("priceEGP") ?? "").trim();
  const availabilityStatus = String(formData.get("availabilityStatus") ?? "AVAILABLE");
  const bookingUrlRaw = String(formData.get("bookingUrl") ?? "").trim();

  if (!AVAILABILITY_VALUES.includes(availabilityStatus as never)) {
    return { error: "Invalid availability status." };
  }

  await prisma.counselor.update({
    where: { id: session.counselorId },
    data: {
      priceEGP: priceRaw === "" ? null : Math.max(0, Number(priceRaw)),
      availabilityStatus: availabilityStatus as never,
      bookingUrl: bookingUrlRaw || null,
    },
  });

  revalidatePath("/therapist/calendar");
  revalidatePath("/therapist/profile");
  revalidatePath("/counseling");
  revalidatePath("/counseling/[slug]", "page");
  revalidatePath("/");
  return { success: true };
}

export async function updateOwnBookingRequestStatus(formData: FormData) {
  const session = await requireCounselor().catch(() => null);
  if (!session) return;

  const bookingId = String(formData.get("bookingId"));
  const status = String(formData.get("status"));

  // Scoped to this counselor's own booking, so a tampered bookingId from
  // another therapist's client is a silent no-op, not a leak.
  await prisma.bookingRequest.updateMany({
    where: { id: bookingId, counselorId: session.counselorId },
    data: { status: status as never },
  });

  revalidatePath("/therapist/clients");
  revalidatePath("/therapist/calendar");
  revalidatePath("/therapist");
}

export type ClientNoteFormState = { error?: string; success?: boolean } | undefined;

function parseSessionDate(raw: string): Date | null {
  if (!raw) return null;
  const d = new Date(`${raw}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseMoods(raw: string): string[] {
  return raw
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
}

export async function addClientNote(
  _prevState: ClientNoteFormState,
  formData: FormData,
): Promise<ClientNoteFormState> {
  const session = await requireCounselor().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const clientEmail = String(formData.get("clientEmail") ?? "").trim();
  const clientName = String(formData.get("clientName") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const nextSteps = String(formData.get("nextSteps") ?? "").trim();
  const moods = parseMoods(String(formData.get("moods") ?? ""));
  const sessionDate = parseSessionDate(String(formData.get("sessionDate") ?? ""));

  if (!clientEmail || !clientName) return { error: "Missing client." };
  if (!notes) return { error: "Please add a note before saving." };

  await prisma.clientNote.create({
    data: {
      counselorId: session.counselorId,
      clientEmail,
      clientName,
      notes,
      nextSteps: nextSteps || null,
      moods,
      ...(sessionDate ? { sessionDate } : {}),
    },
  });

  revalidatePath(`/therapist/clients/${encodeURIComponent(clientEmail)}`);
  revalidatePath("/therapist/clients");
  revalidatePath("/therapist");
  return { success: true };
}

export async function updateClientNote(
  _prevState: ClientNoteFormState,
  formData: FormData,
): Promise<ClientNoteFormState> {
  const session = await requireCounselor().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const noteId = String(formData.get("noteId") ?? "");
  const clientEmail = String(formData.get("clientEmail") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const nextSteps = String(formData.get("nextSteps") ?? "").trim();
  const moods = parseMoods(String(formData.get("moods") ?? ""));
  const sessionDate = parseSessionDate(String(formData.get("sessionDate") ?? ""));

  if (!notes) return { error: "Notes can't be empty." };

  // updateMany with counselorId in the where clause, not update-by-id alone
  // — this is how ownership is enforced against a tampered noteId.
  const result = await prisma.clientNote.updateMany({
    where: { id: noteId, counselorId: session.counselorId },
    data: {
      notes,
      nextSteps: nextSteps || null,
      moods,
      ...(sessionDate ? { sessionDate } : {}),
    },
  });
  if (result.count === 0) return { error: "Note not found." };

  revalidatePath(`/therapist/clients/${encodeURIComponent(clientEmail)}`);
  revalidatePath("/therapist/clients");
  revalidatePath("/therapist");
  return { success: true };
}

export async function deleteClientNote(formData: FormData) {
  const session = await requireCounselor().catch(() => null);
  if (!session) return;

  const noteId = String(formData.get("noteId") ?? "");
  const clientEmail = String(formData.get("clientEmail") ?? "").trim();

  await prisma.clientNote.deleteMany({ where: { id: noteId, counselorId: session.counselorId } });

  revalidatePath(`/therapist/clients/${encodeURIComponent(clientEmail)}`);
  revalidatePath("/therapist/clients");
  revalidatePath("/therapist");
}

export type ToolkitItemFormState = { error?: string; success?: boolean } | undefined;

function dataUriByteSize(dataUri: string): number {
  const base64 = dataUri.split(",")[1] ?? "";
  return Math.floor((base64.length * 3) / 4);
}

export async function addToolkitLink(
  _prevState: ToolkitItemFormState,
  formData: FormData,
): Promise<ToolkitItemFormState> {
  const session = await requireCounselor().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!title) return { error: "Please give it a title." };
  if (!url) return { error: "Please add a link." };
  try {
    new URL(url);
  } catch {
    return { error: "That link doesn't look valid — include https://" };
  }

  await prisma.toolkitItem.create({
    data: { counselorId: session.counselorId, title, description: description || null, kind: "LINK", url },
  });

  revalidatePath("/therapist/toolkit");
  return { success: true };
}

export async function addToolkitPdf(
  _prevState: ToolkitItemFormState,
  formData: FormData,
): Promise<ToolkitItemFormState> {
  const session = await requireCounselor().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const fileData = String(formData.get("fileData") ?? "");
  const fileName = String(formData.get("fileName") ?? "").trim();

  if (!title) return { error: "Please give it a title." };
  if (!fileData.startsWith("data:application/pdf")) return { error: "Please attach a PDF file." };
  if (dataUriByteSize(fileData) > MAX_TOOLKIT_PDF_BYTES) {
    return { error: `That PDF is too large — please keep it under ${Math.floor(MAX_TOOLKIT_PDF_BYTES / (1024 * 1024))}MB.` };
  }

  await prisma.toolkitItem.create({
    data: {
      counselorId: session.counselorId,
      title,
      description: description || null,
      kind: "PDF",
      fileData,
      fileName: fileName || `${title}.pdf`,
    },
  });

  revalidatePath("/therapist/toolkit");
  return { success: true };
}

export async function removeToolkitItem(formData: FormData) {
  const session = await requireCounselor().catch(() => null);
  if (!session) return;

  const itemId = String(formData.get("itemId") ?? "");
  await prisma.toolkitItem.deleteMany({ where: { id: itemId, counselorId: session.counselorId } });

  revalidatePath("/therapist/toolkit");
}

export async function toggleDefaultTool(formData: FormData) {
  const session = await requireCounselor().catch(() => null);
  if (!session) return;

  const key = String(formData.get("key") ?? "");
  if (!CLIENT_TOOLS.some((t) => t.key === key)) return;

  const counselor = await prisma.counselor.findUnique({
    where: { id: session.counselorId },
    select: { hiddenDefaultTools: true },
  });
  if (!counselor) return;

  const hidden = counselor.hiddenDefaultTools.includes(key)
    ? counselor.hiddenDefaultTools.filter((k) => k !== key)
    : [...counselor.hiddenDefaultTools, key];

  await prisma.counselor.update({ where: { id: session.counselorId }, data: { hiddenDefaultTools: hidden } });

  revalidatePath("/therapist/toolkit");
}

export type ReferralFormState = { error?: string; success?: boolean } | undefined;

export async function sendReferral(
  _prevState: ReferralFormState,
  formData: FormData,
): Promise<ReferralFormState> {
  const session = await requireCounselor().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const toCounselorId = String(formData.get("toCounselorId") ?? "").trim();
  const clientEmail = String(formData.get("clientEmail") ?? "").trim();
  const clientName = String(formData.get("clientName") ?? "").trim();
  const clientPhone = String(formData.get("clientPhone") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const includeIntake = formData.get("includeIntake") === "on";
  const noteIds = formData.getAll("noteIds").map((v) => String(v)).filter(Boolean);

  if (!toCounselorId || toCounselorId === session.counselorId) return { error: "Please pick a colleague to refer to." };
  if (!clientEmail || !clientName) return { error: "Missing client." };
  if (!reason) return { error: "Please explain the reason for this referral." };
  if (type !== "FULL_REFERRAL" && type !== "COLLABORATE") return { error: "Please pick a referral type." };

  // Only counselors with portal access can actually receive/see a referral.
  const target = await prisma.counselor.findFirst({
    where: { id: toCounselorId, active: true, passwordHash: { not: null } },
    select: { id: true, name: true, email: true },
  });
  if (!target) return { error: "That colleague isn't available to receive referrals." };

  // Both snapshots are built from THIS counselor's own scoped records only —
  // never a lookup by clientEmail alone, which would leak another
  // counselor's notes on a client of the same name/email.
  let intakeSnapshot: ReferralIntakeSnapshot | null = null;
  if (includeIntake) {
    const latestIntake = await prisma.intakeSubmission.findFirst({
      where: { counselorId: session.counselorId, clientEmail },
      orderBy: { submittedAt: "desc" },
    });
    if (latestIntake) {
      intakeSnapshot = {
        answers: latestIntake.answers as unknown as ReferralIntakeSnapshot["answers"],
        aiSummary: latestIntake.aiSummary,
        submittedAt: latestIntake.submittedAt.toISOString(),
      };
    }
  }

  let notesSnapshot: ReferralNotesSnapshotEntry[] | null = null;
  if (noteIds.length > 0) {
    const notes = await prisma.clientNote.findMany({
      where: { id: { in: noteIds }, counselorId: session.counselorId, clientEmail },
      orderBy: { sessionDate: "desc" },
    });
    if (notes.length > 0) {
      notesSnapshot = notes.map((n) => ({
        sessionDate: n.sessionDate.toISOString(),
        moods: n.moods,
        notes: n.notes,
        nextSteps: n.nextSteps,
      }));
    }
  }

  await prisma.referral.create({
    data: {
      fromCounselorId: session.counselorId,
      toCounselorId: target.id,
      clientName,
      clientEmail,
      clientPhone: clientPhone || null,
      reason,
      type: type as never,
      intakeSnapshot: intakeSnapshot as never,
      notesSnapshot: notesSnapshot as never,
    },
  });

  if (target.email) {
    const baseUrl = await getBaseUrl();
    await sendReferralNotificationEmail({
      to: target.email,
      toName: target.name,
      fromName: session.name,
      clientName,
      reason,
      isFullReferral: type === "FULL_REFERRAL",
      portalUrl: `${baseUrl}/therapist/referrals`,
    });
  }

  revalidatePath("/therapist/referrals");
  return { success: true };
}

export async function acknowledgeReferral(formData: FormData) {
  const session = await requireCounselor().catch(() => null);
  if (!session) return;

  const referralId = String(formData.get("referralId") ?? "");
  await prisma.referral.updateMany({
    where: { id: referralId, toCounselorId: session.counselorId },
    data: { status: "ACKNOWLEDGED", acknowledgedAt: new Date() },
  });

  revalidatePath("/therapist/referrals");
}

export type AssignResourceFormState = { error?: string; success?: boolean } | undefined;

/** Best-effort, non-blocking — a missing/misspelled clientName or email
 * config must never stop the resource itself from being saved. */
async function notifyClientOfAssignedResource(
  clientEmail: string,
  clientName: string,
  counselorName: string,
  kindLabel: string,
) {
  const baseUrl = await getBaseUrl();
  await sendAssignedResourceNotificationEmail({
    to: clientEmail,
    toName: clientName || "there",
    counselorName,
    kindLabel,
    resourcesUrl: `${baseUrl}/resources#my-tools`,
  });
}

export async function assignResourceLink(
  _prevState: AssignResourceFormState,
  formData: FormData,
): Promise<AssignResourceFormState> {
  const session = await requireCounselor().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const clientEmail = String(formData.get("clientEmail") ?? "").trim();
  const clientName = String(formData.get("clientName") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!clientEmail) return { error: "Missing client." };
  if (!title) return { error: "Please give it a title." };
  if (!url) return { error: "Please add a link." };
  try {
    new URL(url);
  } catch {
    return { error: "That link doesn't look valid — include https://" };
  }

  await prisma.assignedResource.create({
    data: { counselorId: session.counselorId, clientEmail, title, description: description || null, kind: "LINK", url },
  });
  await notifyClientOfAssignedResource(clientEmail, clientName, session.name, "a tool");

  revalidatePath(`/therapist/clients/${encodeURIComponent(clientEmail)}`);
  return { success: true };
}

export async function assignResourcePdf(
  _prevState: AssignResourceFormState,
  formData: FormData,
): Promise<AssignResourceFormState> {
  const session = await requireCounselor().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const clientEmail = String(formData.get("clientEmail") ?? "").trim();
  const clientName = String(formData.get("clientName") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const fileData = String(formData.get("fileData") ?? "");
  const fileName = String(formData.get("fileName") ?? "").trim();

  if (!clientEmail) return { error: "Missing client." };
  if (!title) return { error: "Please give it a title." };
  if (!fileData.startsWith("data:application/pdf")) return { error: "Please attach a PDF file." };
  if (dataUriByteSize(fileData) > MAX_TOOLKIT_PDF_BYTES) {
    return { error: `That PDF is too large — please keep it under ${Math.floor(MAX_TOOLKIT_PDF_BYTES / (1024 * 1024))}MB.` };
  }

  await prisma.assignedResource.create({
    data: {
      counselorId: session.counselorId,
      clientEmail,
      title,
      description: description || null,
      kind: "PDF",
      fileData,
      fileName: fileName || `${title}.pdf`,
    },
  });
  await notifyClientOfAssignedResource(clientEmail, clientName, session.name, "a PDF");

  revalidatePath(`/therapist/clients/${encodeURIComponent(clientEmail)}`);
  return { success: true };
}

export async function assignResourceNote(
  _prevState: AssignResourceFormState,
  formData: FormData,
): Promise<AssignResourceFormState> {
  const session = await requireCounselor().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const clientEmail = String(formData.get("clientEmail") ?? "").trim();
  const clientName = String(formData.get("clientName") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const isAssignment = formData.get("isAssignment") === "on";

  if (!clientEmail) return { error: "Missing client." };
  if (!title) return { error: "Please give it a title." };
  if (!content) return { error: "Please write something for your client to see." };

  await prisma.assignedResource.create({
    data: { counselorId: session.counselorId, clientEmail, title, kind: isAssignment ? "ASSIGNMENT" : "TEXT", content },
  });
  await notifyClientOfAssignedResource(clientEmail, clientName, session.name, isAssignment ? "an assignment" : "a note");

  revalidatePath(`/therapist/clients/${encodeURIComponent(clientEmail)}`);
  return { success: true };
}

export async function removeAssignedResource(formData: FormData) {
  const session = await requireCounselor().catch(() => null);
  if (!session) return;

  const itemId = String(formData.get("itemId") ?? "");
  const clientEmail = String(formData.get("clientEmail") ?? "").trim();

  await prisma.assignedResource.deleteMany({ where: { id: itemId, counselorId: session.counselorId } });

  revalidatePath(`/therapist/clients/${encodeURIComponent(clientEmail)}`);
}
