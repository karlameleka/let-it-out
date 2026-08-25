"use server";

import { prisma } from "@/lib/db";
import { requireCounselor } from "@/lib/therapist-session";
import { revalidatePath } from "next/cache";
import { CLIENT_TOOLS, MAX_TOOLKIT_PDF_BYTES } from "@/lib/therapist-toolkit";

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
