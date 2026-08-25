"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { getUpcomingPageData } from "@/lib/upcoming-items";

export async function markNotificationRead(itemId: string) {
  const session = await requireUser().catch(() => null);
  if (!session || !itemId) return;

  await prisma.notificationRead.upsert({
    where: { userId_itemId: { userId: session.userId, itemId } },
    update: {},
    create: { userId: session.userId, itemId },
  });

  revalidatePath("/upcoming");
}

/** Swipe-to-delete on /upcoming — permanently hides this notification for
 * this client only. The underlying session/request/event is untouched. */
export async function dismissNotification(itemId: string) {
  const session = await requireUser().catch(() => null);
  if (!session || !itemId) return;

  await prisma.notificationRead.upsert({
    where: { userId_itemId: { userId: session.userId, itemId } },
    update: { dismissed: true },
    create: { userId: session.userId, itemId, dismissed: true },
  });

  revalidatePath("/upcoming");
}

export async function markAllNotificationsRead() {
  const session = await requireUser().catch(() => null);
  if (!session) return;

  const { sessions, events } = await getUpcomingPageData(session.email, session.userId);
  const itemIds = [...sessions.map((s) => s.id), ...events.map((e) => e.id)];
  if (itemIds.length === 0) return;

  await prisma.notificationRead.createMany({
    data: itemIds.map((itemId) => ({ userId: session.userId, itemId })),
    skipDuplicates: true,
  });

  revalidatePath("/upcoming");
}
