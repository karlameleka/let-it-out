"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/locale";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export type PushSubscriptionInput = z.infer<typeof subscribeSchema>;

/** Saves (or refreshes) a browser's push subscription for the logged-in user. */
export async function subscribeToPush(input: PushSubscriptionInput): Promise<{ error?: string; success?: boolean }> {
  const parsed = subscribeSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid subscription." };
  }

  const user = await requireUser().catch(() => null);
  if (!user) return { error: "Please log in to enable reminders." };

  const { endpoint, keys } = parsed.data;
  const locale = await getLocale();

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId: user.userId, p256dh: keys.p256dh, auth: keys.auth, locale },
    create: { userId: user.userId, endpoint, p256dh: keys.p256dh, auth: keys.auth, locale },
  });

  return { success: true };
}

/** Removes a subscription — e.g. when the user turns reminders off. */
export async function unsubscribeFromPush(endpoint: string): Promise<{ success: boolean }> {
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  return { success: true };
}

/** Whether the logged-in user currently has any active push subscription. */
export async function hasActivePushSubscription(): Promise<boolean> {
  const user = await requireUser().catch(() => null);
  if (!user) return false;
  const count = await prisma.pushSubscription.count({ where: { userId: user.userId } });
  return count > 0;
}
