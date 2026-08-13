"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

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

  await prisma.bookingRequest.create({
    data: {
      ...parsed.data,
      userId: user?.userId,
    },
  });

  return { success: true };
}
