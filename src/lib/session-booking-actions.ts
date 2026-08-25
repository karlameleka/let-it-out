"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendSupportNotification, sendCustomerConfirmation } from "@/lib/email";
import { syncLeadToAirtable } from "@/lib/airtable";
import { createLead } from "@/lib/leads";
import { sendIntakeFormLink } from "@/lib/intake-actions";
import { formatEGP } from "@/lib/format";

const createSessionBookingSchema = z.object({
  counselorId: z.string().min(1),
  name: z.string().trim().min(1, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email."),
  phone: z.string().trim().min(5, "Please enter a valid phone number."),
  preferredDate: z.string().trim().min(1, "Please choose a preferred day."),
  // Set when picked from the in-app slot picker (counselor has
  // CounselorAvailability windows configured) — empty/omitted for the
  // day-only fallback, where the counselor follows up to confirm a time.
  preferredTime: z.string().trim().optional(),
  promoCode: z.string().trim().optional(),
});

export type CreateSessionBookingInput = z.infer<typeof createSessionBookingSchema>;
export type CreateSessionBookingResult = { error: string } | { sessionBookingId: string };

export type CounselingPromoCheckResult =
  | { valid: true; code: string; discountEGP: number; label: string }
  | { valid: false; error: string };

/** Server-computed discount preview for a paid session booking — mirrors
 * checkPromoCode in order-actions.ts but scoped to counselors instead of
 * shop products. Re-validated again inside createSessionBooking. */
export async function checkCounselingPromoCode(
  rawCode: string,
  counselorId: string,
  priceEGP: number,
): Promise<CounselingPromoCheckResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { valid: false, error: "Enter a code." };

  const promo = await prisma.promoCode.findUnique({
    where: { code },
    include: { counselors: true },
  });
  if (!promo || !promo.active) return { valid: false, error: "That code isn't valid." };
  if (promo.expiresAt && promo.expiresAt < new Date()) return { valid: false, error: "That code has expired." };
  if (promo.maxRedemptions !== null && promo.redemptionCount >= promo.maxRedemptions) {
    return { valid: false, error: "That code has already been fully redeemed." };
  }
  if (promo.minOrderEGP !== null && priceEGP < promo.minOrderEGP) {
    return { valid: false, error: `This code needs a minimum session price of ${formatEGP(promo.minOrderEGP)}.` };
  }
  const scopedCounselorIds = promo.counselors.map((c) => c.counselorId);
  if (scopedCounselorIds.length > 0 && !scopedCounselorIds.includes(counselorId)) {
    return { valid: false, error: "This code doesn't apply to this therapist." };
  }

  const discountEGP =
    promo.discountType === "PERCENT" ? Math.round((priceEGP * promo.discountValue) / 100) : Math.min(promo.discountValue, priceEGP);
  const label = promo.discountType === "PERCENT" ? `${promo.discountValue}% off` : `${formatEGP(promo.discountValue)} off`;

  return { valid: true, code, discountEGP, label };
}

export async function createSessionBooking(
  input: CreateSessionBookingInput,
): Promise<CreateSessionBookingResult> {
  const parsed = createSessionBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const counselor = await prisma.counselor.findUnique({ where: { id: parsed.data.counselorId } });
  if (!counselor || !counselor.active || !counselor.priceEGP) {
    return { error: "This counselor isn't available for online booking right now." };
  }

  // A real slot from the in-app picker is a commitment being paid for —
  // re-check server-side that nobody else grabbed it in the moment between
  // this client loading the page and submitting, since the client-side
  // list could be stale.
  if (parsed.data.preferredTime) {
    const clash = await prisma.sessionBooking.findFirst({
      where: {
        counselorId: counselor.id,
        preferredDate: parsed.data.preferredDate,
        preferredTime: parsed.data.preferredTime,
        status: { not: "CANCELLED" },
      },
    });
    if (clash) return { error: "That time was just taken — please pick another slot." };
  }

  let discountEGP = 0;
  let promoCodeId: string | null = null;
  if (parsed.data.promoCode) {
    const check = await checkCounselingPromoCode(parsed.data.promoCode, counselor.id, counselor.priceEGP);
    if (!check.valid) return { error: check.error };
    discountEGP = check.discountEGP;
    promoCodeId = (await prisma.promoCode.findUnique({ where: { code: check.code } }))!.id;
  }

  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.sessionBooking.create({
      data: {
        counselorId: counselor.id,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        preferredDate: parsed.data.preferredDate,
        preferredTime: parsed.data.preferredTime || null,
        priceEGP: counselor.priceEGP!,
        promoCodeId,
        discountEGP,
      },
    });
    if (promoCodeId) {
      await tx.promoCode.update({ where: { id: promoCodeId }, data: { redemptionCount: { increment: 1 } } });
    }
    return created;
  });

  const finalPriceEGP = counselor.priceEGP - discountEGP;
  const dateTimeLine = booking.preferredTime
    ? `Session time: ${booking.preferredDate} at ${booking.preferredTime}`
    : `Preferred day: ${booking.preferredDate}`;
  const notes = `Counselor: ${counselor.name}\n${dateTimeLine}\nPrice: ${formatEGP(finalPriceEGP)}${discountEGP > 0 ? ` (${formatEGP(counselor.priceEGP)} - ${formatEGP(discountEGP)} promo)` : ""}`;

  await createLead({
    name: booking.name,
    type: "COUNSELING_INQUIRY",
    email: booking.email,
    phone: booking.phone,
    source: "Website",
    sessionType: counselor.name,
    orderTotalEGP: finalPriceEGP,
    notes,
  });

  await syncLeadToAirtable({
    Name: booking.name,
    Type: "Counseling Inquiry",
    Status: "New",
    Email: booking.email,
    Phone: booking.phone,
    Source: "Website",
    "Session Type": counselor.name,
    "Order Total": finalPriceEGP,
    Notes: notes,
  });

  await sendSupportNotification({
    subject: "New paid counseling booking started",
    lines: [
      { label: "Name", value: booking.name },
      { label: "Email", value: booking.email },
      { label: "Phone", value: booking.phone },
      { label: "Counselor", value: counselor.name },
      { label: "Preferred day", value: booking.preferredDate },
      ...(booking.preferredTime ? [{ label: "Time", value: booking.preferredTime }] : []),
      { label: "Price", value: formatEGP(finalPriceEGP) },
    ],
    extraRecipients: [counselor.email],
  });

  await sendCustomerConfirmation({
    to: booking.email,
    name: booking.name,
    subject: "Complete your payment to book your session",
    intro: booking.preferredTime
      ? `Thanks for choosing ${counselor.name}! Complete your payment of ${formatEGP(finalPriceEGP)} to confirm your session.`
      : `Thanks for choosing ${counselor.name}! Complete your payment of ${formatEGP(finalPriceEGP)} — we'll confirm your exact session time with you afterward.`,
    lines: [
      { label: "Counselor", value: counselor.name },
      { label: "Preferred day", value: booking.preferredDate },
      ...(booking.preferredTime ? [{ label: "Time", value: booking.preferredTime }] : []),
      { label: "Price", value: formatEGP(finalPriceEGP) },
    ],
  });

  await sendIntakeFormLink({
    clientName: booking.name,
    clientEmail: booking.email,
    counselorId: counselor.id,
    counselorName: counselor.name,
    counselorEmail: counselor.email,
  });

  return { sessionBookingId: booking.id };
}
