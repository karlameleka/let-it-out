"use server";

import { prisma } from "@/lib/db";
import { requireCounselor } from "@/lib/therapist-session";
import { revalidatePath } from "next/cache";

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
