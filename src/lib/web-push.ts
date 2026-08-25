import "server-only";
import webpush from "web-push";
import { prisma } from "@/lib/db";

let configured = false;

/** Lazily configures the web-push library with VAPID keys, once. */
export function getWebPush() {
  if (!configured) {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;
    if (publicKey && privateKey && subject) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
    }
    configured = true;
  }
  return webpush;
}

export type PushPayload = { title: string; body: string; url: string };

/**
 * Fans a push notification out to every subscribed browser (the daily
 * journal reminder cron and the new-event announcement both use this) —
 * fails silently and returns zero counts when web push isn't configured,
 * same fail-silent convention as the rest of the notification senders in
 * this app. Expired/gone subscriptions (404/410) are cleaned up as they're
 * found rather than left to accumulate.
 */
export async function sendPushToAllSubscribers(payload: PushPayload): Promise<{ sent: number; removed: number; total: number }> {
  if (!process.env.VAPID_PRIVATE_KEY) return { sent: 0, removed: 0, total: 0 };

  const webpushClient = getWebPush();
  const subscriptions = await prisma.pushSubscription.findMany();
  const json = JSON.stringify(payload);

  let sent = 0;
  let removed = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpushClient.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          json,
        );
        sent++;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          removed++;
        } else {
          console.error("[web-push] Failed to send push notification:", err);
        }
      }
    }),
  );

  return { sent, removed, total: subscriptions.length };
}
