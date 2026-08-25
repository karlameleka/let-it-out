import "server-only";
import { prisma } from "@/lib/db";

/**
 * Fully removes a client account and everything owned only by that
 * account. Order and BookingRequest are real business/accounting records
 * (a paid order, a session request) — they're kept and just disassociated
 * (userId set null) rather than deleted, matching how orders/bookings
 * already survive a self-service account deletion. Everything else here
 * (JournalEntry, PushSubscription, SupportChat) has no meaning without the
 * account it belongs to, so it's deleted outright. Shared by both the
 * client's own "Delete my account" flow and the admin-initiated one.
 */
export async function deleteUserAccountCompletely(userId: string) {
  await prisma.$transaction([
    prisma.journalEntry.deleteMany({ where: { userId } }),
    prisma.pushSubscription.deleteMany({ where: { userId } }),
    prisma.supportChat.deleteMany({ where: { userId } }),
    prisma.order.updateMany({ where: { userId }, data: { userId: null } }),
    prisma.bookingRequest.updateMany({ where: { userId }, data: { userId: null } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
}
