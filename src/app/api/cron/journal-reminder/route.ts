import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getWebPush } from "@/lib/web-push";

const MESSAGES = [
  "A new prompt is waiting for you — take a few minutes to write.",
  "Your journal missed you today. A few sentences is enough.",
  "Time to let it out — how has today felt so far?",
  "A quiet moment for yourself: your journal is ready when you are.",
];

export async function GET(req: NextRequest) {
  // Vercel Cron automatically sends this bearer token when CRON_SECRET is
  // set on the project — this also lets you trigger it manually for testing.
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const webpush = getWebPush();
  if (!process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "Web push is not configured." }, { status: 503 });
  }

  const subscriptions = await prisma.pushSubscription.findMany();
  const payload = JSON.stringify({
    title: "Let It Out",
    body: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
    url: "/journal",
  });

  let sent = 0;
  let removed = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        sent++;
      } catch (err: unknown) {
        // 404/410 means the browser subscription no longer exists — clean it up.
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          removed++;
        } else {
          console.error("[journal-reminder] Failed to send push notification:", err);
        }
      }
    }),
  );

  return NextResponse.json({ sent, removed, total: subscriptions.length });
}
