"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { sendSupportNotification, sendCustomerConfirmation } from "@/lib/email";
import { syncLeadToAirtable } from "@/lib/airtable";
import { createLead } from "@/lib/leads";
import { sendIntakeFormLink } from "@/lib/intake-actions";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionary";

const SESSION_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL_COUNSELING: "Individual",
  COUPLES_COUNSELING: "Couples",
  FOLLOW_UP: "Follow-up",
  OTHER: "Other",
};

function sessionTypeLabelFor(sessionType: string, b: Dictionary["bookingForm"]): string {
  switch (sessionType) {
    case "INDIVIDUAL_COUNSELING":
      return b.typeIndividual;
    case "COUPLES_COUNSELING":
      return b.typeCouples;
    case "FOLLOW_UP":
      return b.typeFollowUp;
    default:
      return b.typeOther;
  }
}

function buildBookingSchema(v: Dictionary["validation"], b: Dictionary["bookingForm"]) {
  return z.object({
    counselorId: z.string().min(1),
    name: z.string().trim().min(1, v.nameRequired),
    email: z.string().trim().email(v.emailInvalid),
    phone: z.string().trim().min(5, v.phoneInvalid),
    sessionType: z.enum(["INDIVIDUAL_COUNSELING", "COUPLES_COUNSELING", "FOLLOW_UP", "OTHER"]),
    preferredDate: z.string().trim().min(1, b.dateRequired),
    preferredTime: z.string().trim().min(1, b.timeRequired),
    message: z.string().trim().optional(),
  });
}

export type BookingFormState = { error?: string; success?: boolean } | undefined;

export async function submitBookingRequest(
  _prevState: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const parsed = buildBookingSchema(dict.validation, dict.bookingForm).safeParse({
    counselorId: formData.get("counselorId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    sessionType: formData.get("sessionType"),
    preferredDate: formData.get("preferredDate"),
    preferredTime: formData.get("preferredTime"),
    message: formData.get("message") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? dict.validation.invalidInput };
  }

  const user = await getCurrentUser();

  const booking = await prisma.bookingRequest.create({
    data: {
      ...parsed.data,
      userId: user?.userId,
    },
    include: { counselor: true },
  });

  const bookingNotes = [
    `Counselor: ${booking.counselor.name}`,
    `Preferred date: ${booking.preferredDate}`,
    `Preferred time: ${booking.preferredTime}`,
    booking.message ? `Message: ${booking.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  const sessionTypeLabel = SESSION_TYPE_LABELS[booking.sessionType] ?? booking.sessionType;

  await createLead({
    name: booking.name,
    type: "COUNSELING_INQUIRY",
    email: booking.email,
    phone: booking.phone,
    source: "Website",
    sessionType: sessionTypeLabel,
    notes: bookingNotes,
  });

  await syncLeadToAirtable({
    Name: booking.name,
    Type: "Counseling Inquiry",
    Status: "New",
    Email: booking.email,
    Phone: booking.phone,
    Source: "Website",
    "Session Type": sessionTypeLabel,
    Notes: bookingNotes,
  });

  await sendSupportNotification({
    subject: "New counseling session request",
    lines: [
      { label: "Name", value: booking.name },
      { label: "Email", value: booking.email },
      { label: "Phone", value: booking.phone },
      { label: "Counselor", value: booking.counselor.name },
      { label: "Session type", value: booking.sessionType.replaceAll("_", " ") },
      { label: "Preferred date", value: booking.preferredDate },
      { label: "Preferred time", value: booking.preferredTime },
      { label: "Message", value: booking.message || "Not provided" },
    ],
    extraRecipients: [booking.counselor.email],
  });

  const isAr = locale === "ar";
  await sendCustomerConfirmation({
    to: booking.email,
    name: booking.name,
    locale,
    subject: isAr ? "استلمنا طلب جلستك" : "We've received your session request",
    intro: isAr
      ? `شكرًا لطلبك جلسة مع ${booking.counselor.name}. الموعد المفضل مش مؤكد لسه — هنتواصل معاك لتأكيد موعدك في أقرب وقت.`
      : `Thank you for requesting a session with ${booking.counselor.name}. Your preferred date and time aren't guaranteed yet — we'll reach out to confirm your appointment as soon as possible.`,
    lines: [
      { label: isAr ? "المعالج" : "Counselor", value: booking.counselor.name },
      { label: isAr ? "نوع الجلسة" : "Session type", value: sessionTypeLabelFor(booking.sessionType, dict.bookingForm) },
      { label: isAr ? "التاريخ المفضل" : "Preferred date", value: booking.preferredDate },
      { label: isAr ? "الوقت المفضل" : "Preferred time", value: booking.preferredTime },
    ],
  });

  await sendIntakeFormLink({
    clientName: booking.name,
    clientEmail: booking.email,
    counselorId: booking.counselor.id,
    counselorName: booking.counselor.name,
    counselorEmail: booking.counselor.email,
    locale,
  });

  return { success: true };
}
