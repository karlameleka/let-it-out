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

/** Either one payload sent to everyone, or a payload per site locale —
 * each subscriber gets the payload matching their subscription's stored
 * locale (falling back to "en" for anything else). */
export type PushPayloadInput = PushPayload | Partial<Record<string, PushPayload>>;

function isLocaleMap(payload: PushPayloadInput): payload is Partial<Record<string, PushPayload>> {
  return !("title" in payload);
}

/**
 * Fans a push notification out to every subscribed browser (the daily
 * journal reminder cron and the new-event announcement both use this) —
 * fails silently and returns zero counts when web push isn't configured,
 * same fail-silent convention as the rest of the notification senders in
 * this app. Expired/gone subscriptions (404/410) are cleaned up as they're
 * found rather than left to accumulate.
 */
export async function sendPushToAllSubscribers(payload: PushPayloadInput): Promise<{ sent: number; removed: number; total: number }> {
  if (!process.env.VAPID_PRIVATE_KEY) return { sent: 0, removed: 0, total: 0 };

  const webpushClient = getWebPush();
  const subscriptions = await prisma.pushSubscription.findMany();
  const localeMap = isLocaleMap(payload) ? payload : null;

  let sent = 0;
  let removed = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      const forSub = localeMap ? (localeMap[sub.locale] ?? localeMap.en) : payload;
      if (!forSub) return;
      try {
        await webpushClient.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(forSub),
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

/**
 * Sends a push to just the subscriptions belonging to specific users,
 * resolved by email (the session-reminders cron uses this — a
 * SessionBooking/BookingRequest only has a plain email string, not a
 * userId, so subscriptions are found via User.email rather than a direct
 * relation). Emails with no matching account, or an account with no push
 * subscription, are silently skipped. Same expired-subscription cleanup
 * as sendPushToAllSubscribers.
 */
export async function sendPushToEmails(emails: string[], payload: PushPayload): Promise<{ sent: number; removed: number; total: number }> {
  if (!process.env.VAPID_PRIVATE_KEY || emails.length === 0) return { sent: 0, removed: 0, total: 0 };

  const webpushClient = getWebPush();
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { user: { email: { in: emails } } },
  });
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
