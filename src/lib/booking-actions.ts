"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { sendSupportNotification, sendCustomerConfirmation } from "@/lib/email";
import { syncLeadToAirtable } from "@/lib/airtable";
import { createLead } from "@/lib/leads";
import { sendIntakeFormLink } from "@/lib/intake-actions";

const SESSION_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL_COUNSELING: "Individual",
  COUPLES_COUNSELING: "Couples",
  FOLLOW_UP: "Follow-up",
  OTHER: "Other",
};

const bookingSchema = z.object({
  counselorId: z.string().min(1),
  name: z.string().trim().min(1, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email."),
  phone: z.string().trim().min(5, "Please enter a valid phone number."),
  sessionType: z.enum(["INDIVIDUAL_COUNSELING", "COUPLES_COUNSELING", "FOLLOW_UP", "OTHER"]),
  preferredDate: z.string().trim().min(1, "Please choose a preferred date."),
  preferredTime: z.string().trim().min(1, "Please choose a preferred time."),
  message: z.string().trim().optional(),
});

export type BookingFormState = { error?: string; success?: boolean } | undefined;

export async function submitBookingRequest(
  _prevState: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const parsed = bookingSchema.safeParse({
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
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
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
      { label: "Message", value: booking.message || "—" },
    ],
    extraRecipients: [booking.counselor.email],
  });

  await sendCustomerConfirmation({
    to: booking.email,
    name: booking.name,
    subject: "We've received your session request",
    intro: `Thank you for requesting a session with ${booking.counselor.name}. Your preferred date and time aren't guaranteed yet — we'll reach out to confirm your appointment as soon as possible.`,
    lines: [
      { label: "Counselor", value: booking.counselor.name },
      { label: "Session type", value: booking.sessionType.replaceAll("_", " ") },
      { label: "Preferred date", value: booking.preferredDate },
      { label: "Preferred time", value: booking.preferredTime },
    ],
  });

  await sendIntakeFormLink({
    clientName: booking.name,
    clientEmail: booking.email,
    counselorId: booking.counselor.id,
    counselorName: booking.counselor.name,
    counselorEmail: booking.counselor.email,
  });

  return { success: true };
}
