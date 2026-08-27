"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendSupportNotification, sendCustomerConfirmation } from "@/lib/email";
import { syncLeadToAirtable } from "@/lib/airtable";
import { createLead } from "@/lib/leads";
import { sendIntakeFormLink } from "@/lib/intake-actions";
import { formatEGP } from "@/lib/format";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionary";

function buildCreateSessionBookingSchema(v: Dictionary["validation"], c: Dictionary["counselorProfile"]) {
  return z.object({
    counselorId: z.string().min(1),
    name: z.string().trim().min(1, v.nameRequired),
    email: z.string().trim().email(v.emailInvalid),
    phone: z.string().trim().min(5, v.phoneInvalid),
    preferredDate: z.string().trim().min(1, c.dayRequired),
    // Set when picked from the in-app slot picker (counselor has
    // CounselorAvailability windows configured) — empty/omitted for the
    // day-only fallback, where the counselor follows up to confirm a time.
    preferredTime: z.string().trim().optional(),
    promoCode: z.string().trim().optional(),
  });
}

export type CreateSessionBookingInput = z.infer<ReturnType<typeof buildCreateSessionBookingSchema>>;
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
  const locale = await getLocale();
  const c = getDictionary(locale).counselorProfile;

  const code = rawCode.trim().toUpperCase();
  if (!code) return { valid: false, error: c.promoEnterCode };

  const promo = await prisma.promoCode.findUnique({
    where: { code },
    include: { counselors: true },
  });
  if (!promo || !promo.active) return { valid: false, error: c.promoInvalid };
  if (promo.expiresAt && promo.expiresAt < new Date()) return { valid: false, error: c.promoExpired };
  if (promo.maxRedemptions !== null && promo.redemptionCount >= promo.maxRedemptions) {
    return { valid: false, error: c.promoFullyRedeemed };
  }
  if (promo.minOrderEGP !== null && priceEGP < promo.minOrderEGP) {
    return { valid: false, error: c.promoMinOrder.replace("{amount}", formatEGP(promo.minOrderEGP)) };
  }
  const scopedCounselorIds = promo.counselors.map((pc) => pc.counselorId);
  if (scopedCounselorIds.length > 0 && !scopedCounselorIds.includes(counselorId)) {
    return { valid: false, error: c.promoNotApplicable };
  }

  const discountEGP =
    promo.discountType === "PERCENT" ? Math.round((priceEGP * promo.discountValue) / 100) : Math.min(promo.discountValue, priceEGP);
  const label = promo.discountType === "PERCENT" ? `${promo.discountValue}% off` : `${formatEGP(promo.discountValue)} off`;

  return { valid: true, code, discountEGP, label };
}

export async function createSessionBooking(
  input: CreateSessionBookingInput,
): Promise<CreateSessionBookingResult> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const c = dict.counselorProfile;

  const parsed = buildCreateSessionBookingSchema(dict.validation, c).safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? dict.validation.invalidInput };
  }

  const counselor = await prisma.counselor.findUnique({ where: { id: parsed.data.counselorId } });
  if (!counselor || !counselor.active || !counselor.priceEGP) {
    return { error: c.counselorUnavailable };
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
    if (clash) return { error: c.timeJustTaken };
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
        locale,
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

  const isAr = locale === "ar";
  await sendCustomerConfirmation({
    to: booking.email,
    name: booking.name,
    locale,
    subject: isAr ? "أكمل الدفع لحجز جلستك" : "Complete your payment to book your session",
    intro: booking.preferredTime
      ? isAr
        ? `شكرًا لاختيارك ${counselor.name}! أكمل عملية الدفع بقيمة ${formatEGP(finalPriceEGP)} لتأكيد جلستك.`
        : `Thanks for choosing ${counselor.name}! Complete your payment of ${formatEGP(finalPriceEGP)} to confirm your session.`
      : isAr
        ? `شكرًا لاختيارك ${counselor.name}! أكمل عملية الدفع بقيمة ${formatEGP(finalPriceEGP)} — هنأكد ميعاد جلستك بالظبط بعد كده.`
        : `Thanks for choosing ${counselor.name}! Complete your payment of ${formatEGP(finalPriceEGP)} — we'll confirm your exact session time with you afterward.`,
    lines: [
      { label: isAr ? "المعالج" : "Counselor", value: counselor.name },
      { label: isAr ? "اليوم المفضل" : "Preferred day", value: booking.preferredDate },
      ...(booking.preferredTime ? [{ label: isAr ? "الوقت" : "Time", value: booking.preferredTime }] : []),
      { label: isAr ? "السعر" : "Price", value: formatEGP(finalPriceEGP) },
    ],
  });

  await sendIntakeFormLink({
    clientName: booking.name,
    clientEmail: booking.email,
    counselorId: counselor.id,
    counselorName: counselor.name,
    counselorEmail: counselor.email,
    locale,
  });

  return { sessionBookingId: booking.id };
}
