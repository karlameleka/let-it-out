"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { sendSupportNotification } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { pastCancelWindow } from "@/lib/cancel-window";

export type CancelResult = { error: string } | { success: true };

export async function cancelSessionBooking(id: string): Promise<CancelResult> {
  const session = await requireUser().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const booking = await prisma.sessionBooking.findUnique({ where: { id }, include: { counselor: true } });
  if (!booking || booking.email !== session.email) return { error: "Booking not found." };
  if (booking.status === "CANCELLED") return { error: "This booking is already cancelled." };
  if (booking.status === "CONFIRMED" && pastCancelWindow(booking.preferredDate, booking.preferredTime)) {
    return { error: "This session is less than 24 hours away and can no longer be cancelled online." };
  }

  await prisma.sessionBooking.update({ where: { id }, data: { status: "CANCELLED" } });

  await sendSupportNotification({
    subject: "A client cancelled their session booking",
    lines: [
      { label: "Name", value: booking.name },
      { label: "Email", value: booking.email },
      { label: "Counselor", value: booking.counselor.name },
      { label: "Was", value: booking.status },
      { label: "Preferred day", value: booking.preferredDate },
      ...(booking.preferredTime ? [{ label: "Time", value: booking.preferredTime }] : []),
    ],
    extraRecipients: [booking.counselor.email],
  });

  revalidatePath("/upcoming");
  revalidatePath(`/counseling/session/${id}`);
  return { success: true };
}

export async function cancelBookingRequest(id: string): Promise<CancelResult> {
  const session = await requireUser().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const request = await prisma.bookingRequest.findUnique({ where: { id }, include: { counselor: true } });
  if (!request || request.email !== session.email) return { error: "Request not found." };
  if (request.status === "CANCELLED" || request.status === "COMPLETED") {
    return { error: "This request can no longer be cancelled." };
  }
  if (request.status === "CONFIRMED" && pastCancelWindow(request.preferredDate, request.preferredTime)) {
    return { error: "This session is less than 24 hours away and can no longer be cancelled online." };
  }

  await prisma.bookingRequest.update({ where: { id }, data: { status: "CANCELLED" } });

  await sendSupportNotification({
    subject: "A client cancelled their session request",
    lines: [
      { label: "Name", value: request.name },
      { label: "Email", value: request.email },
      { label: "Counselor", value: request.counselor.name },
      { label: "Was", value: request.status },
      { label: "Preferred day", value: request.preferredDate },
      { label: "Time", value: request.preferredTime },
    ],
    extraRecipients: [request.counselor.email],
  });

  revalidatePath("/upcoming");
  return { success: true };
}
