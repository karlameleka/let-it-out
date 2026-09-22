import "server-only";
import { prisma } from "@/lib/db";

/** A logged-in client's own shop orders — matched strictly by userId, never
 * by email, so a guest checkout that happens to share an email address
 * never surfaces in someone else's My Profile/My Orders (see Order.userId
 * being nullable for guest checkouts in schema.prisma). */
export async function getMyOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export type MyOrder = Awaited<ReturnType<typeof getMyOrders>>[number];
