import "server-only";
import { prisma } from "@/lib/db";
import { sendSupportNotification } from "@/lib/email";

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
export async function deleteUserAccountCompletely(userId: string, initiatedBy: "self" | "admin" = "self") {
  // Read before the transaction — the row won't exist to look up afterward.
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, accountCode: true } });

  await prisma.$transaction([
    prisma.journalEntry.deleteMany({ where: { userId } }),
    prisma.pushSubscription.deleteMany({ where: { userId } }),
    prisma.supportChat.deleteMany({ where: { userId } }),
    prisma.order.updateMany({ where: { userId }, data: { userId: null } }),
    prisma.bookingRequest.updateMany({ where: { userId }, data: { userId: null } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  if (user) {
    await sendSupportNotification({
      subject: "An account was deleted",
      lines: [
        { label: "Name", value: user.name },
        { label: "Email", value: user.email },
        { label: "Account code", value: user.accountCode },
        { label: "Deleted by", value: initiatedBy === "admin" ? "Admin (from the dashboard)" : "The account holder (self-service)" },
      ],
    }).catch((err) => console.error("[account-deletion] Failed to send deletion notification email:", err));
  }
}
