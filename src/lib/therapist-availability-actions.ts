"use server";

import { prisma } from "@/lib/db";
import { requireCounselor } from "@/lib/therapist-session";
import { revalidatePath } from "next/cache";
import { todayISO } from "@/lib/therapist-data";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// How far out a therapist can open a one-off single-date window — same
// horizon getAvailableSlots() slices slots for (DAYS_AHEAD in availability.ts).
const MAX_DATE_DAYS_AHEAD = 30;

export type AddAvailabilityWindowState = { error?: string } | undefined;

export async function addAvailabilityWindow(
  _prevState: AddAvailabilityWindowState,
  formData: FormData,
): Promise<AddAvailabilityWindowState> {
  const session = await requireCounselor().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const dayOfWeek = Number(formData.get("dayOfWeek"));
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");

  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return { error: "Please choose a day." };
  }
  if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
    return { error: "Please choose valid times." };
  }
  if (startTime >= endTime) {
    return { error: "End time must be after start time." };
  }

  await prisma.counselorAvailability.create({
    data: { counselorId: session.counselorId, dayOfWeek, startTime, endTime },
  });

  revalidatePath("/therapist/calendar");
  revalidatePath("/counseling/[slug]", "page");
  return undefined;
}

/** Opens a one-off availability window for a single specific date, rather
 * than every week — e.g. covering an extra day this month without
 * committing to it as a standing recurring slot. Date must fall between
 * today and MAX_DATE_DAYS_AHEAD days out, matching how far
 * getAvailableSlots() actually slices slots for. */
export async function addDateAvailabilityWindow(
  _prevState: AddAvailabilityWindowState,
  formData: FormData,
): Promise<AddAvailabilityWindowState> {
  const session = await requireCounselor().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");

  if (!DATE_RE.test(date)) {
    return { error: "Please choose a day." };
  }
  const today = todayISO();
  const maxDate = new Date();
  maxDate.setUTCDate(maxDate.getUTCDate() + MAX_DATE_DAYS_AHEAD);
  const maxDateStr = maxDate.toISOString().slice(0, 10);
  if (date < today || date > maxDateStr) {
    return { error: "Please pick a day between today and a month from now." };
  }
  if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime)) {
    return { error: "Please choose valid times." };
  }
  if (startTime >= endTime) {
    return { error: "End time must be after start time." };
  }

  await prisma.counselorAvailability.create({
    data: { counselorId: session.counselorId, date, startTime, endTime },
  });

  revalidatePath("/therapist/calendar");
  revalidatePath("/counseling/[slug]", "page");
  return undefined;
}

export async function deleteAvailabilityWindow(formData: FormData) {
  const session = await requireCounselor().catch(() => null);
  if (!session) return;

  const id = String(formData.get("id") ?? "");
  // Own row only — counselorId in the where clause, never trusted from the
  // form alone, so one therapist can't delete another's window.
  await prisma.counselorAvailability.deleteMany({ where: { id, counselorId: session.counselorId } });

  revalidatePath("/therapist/calendar");
  revalidatePath("/counseling/[slug]", "page");
}
