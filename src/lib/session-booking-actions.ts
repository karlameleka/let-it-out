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
});

export type CreateSessionBookingInput = z.infer<typeof createSessionBookingSchema>;
export type CreateSessionBookingResult = { error: string } | { sessionBookingId: string };

export async function createSessionBooking(
  input: CreateSessionBookingInput,
): Promise<CreateSessionBookingResult> {
  const parsed = createSessionBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const counselor = await prisma.counselor.findUnique({ where: { id: parsed.data.counselorId } });
  if (!counselor || !counselor.active || !counselor.bookingUrl || !counselor.priceEGP) {
    return { error: "This counselor isn't available for online booking right now." };
  }

  const booking = await prisma.sessionBooking.create({
    data: {
      counselorId: counselor.id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      preferredDate: parsed.data.preferredDate,
      priceEGP: counselor.priceEGP,
    },
  });

  const notes = `Counselor: ${counselor.name}\nPreferred day: ${booking.preferredDate}\nPrice: ${formatEGP(counselor.priceEGP)}`;

  await createLead({
    name: booking.name,
    type: "COUNSELING_INQUIRY",
    email: booking.email,
    phone: booking.phone,
    source: "Website",
    sessionType: counselor.name,
    orderTotalEGP: counselor.priceEGP,
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
    "Order Total": counselor.priceEGP,
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
      { label: "Price", value: formatEGP(counselor.priceEGP) },
    ],
    extraRecipients: [counselor.email],
  });

  await sendCustomerConfirmation({
    to: booking.email,
    name: booking.name,
    subject: "Complete your payment to book your session",
    intro: `Thanks for choosing ${counselor.name}! Complete your payment of ${formatEGP(counselor.priceEGP)} to unlock the scheduler and pick your exact session time.`,
    lines: [
      { label: "Counselor", value: counselor.name },
      { label: "Preferred day", value: booking.preferredDate },
      { label: "Price", value: formatEGP(counselor.priceEGP) },
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
