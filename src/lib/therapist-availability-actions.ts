"use server";

import { prisma } from "@/lib/db";
import { requireCounselor } from "@/lib/therapist-session";
import { revalidatePath } from "next/cache";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

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
