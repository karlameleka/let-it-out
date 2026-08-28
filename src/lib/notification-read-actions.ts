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

/** Marks a session booking as joined the first time the client taps its
 * meeting link from /upcoming — from then on it shows under
 * /upcoming/past instead of waiting for preferredDate to pass, since
 * tapping the link means the client actually had the session. Scoped to
 * this client's own email so one client can't flip another's booking. */
export async function markSessionJoined(itemId: string) {
  const session = await requireUser().catch(() => null);
  if (!session || !itemId) return;

  if (itemId.startsWith("session-")) {
    const id = itemId.slice("session-".length);
    await prisma.sessionBooking.updateMany({
      where: { id, email: session.email, joinedAt: null },
      data: { joinedAt: new Date() },
    });
  } else if (itemId.startsWith("request-")) {
    const id = itemId.slice("request-".length);
    await prisma.bookingRequest.updateMany({
      where: { id, email: session.email, joinedAt: null },
      data: { joinedAt: new Date() },
    });
  }

  revalidatePath("/upcoming");
  revalidatePath("/upcoming/past");
}

export async function markAllNotificationsRead() {
  const session = await requireUser().catch(() => null);
  if (!session) return;

  const { sessions, events, reflections } = await getUpcomingPageData(session.email, session.userId);
  const itemIds = [...sessions.map((s) => s.id), ...events.map((e) => e.id), ...reflections.map((r) => r.id)];
  if (itemIds.length === 0) return;

  await prisma.notificationRead.createMany({
    data: itemIds.map((itemId) => ({ userId: session.userId, itemId })),
    skipDuplicates: true,
  });

  revalidatePath("/upcoming");
}
