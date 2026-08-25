import { NextResponse, type NextRequest } from "next/server";
import { sendPushToAllSubscribers } from "@/lib/web-push";

const MESSAGES = [
  "A new prompt is waiting for you — take a few minutes to write.",
  "Your journal missed you today. A few sentences is enough.",
  "Time to let it out — how has today felt so far?",
  "A quiet moment for yourself: your journal is ready when you are.",
];

export async function GET(req: NextRequest) {
  // Vercel Cron automatically sends this bearer token when CRON_SECRET is
  // set on the project — this also lets you trigger it manually for testing.
  // Fails closed: this endpoint fans out a push notification to every
  // subscribed user, so an unset secret must refuse the request rather than
  // leave it open to anyone who finds the URL.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/journal-reminder] CRON_SECRET is not configured — refusing to run.");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "Web push is not configured." }, { status: 503 });
  }

  const result = await sendPushToAllSubscribers({
    title: "Let It Out",
    body: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
    url: "/journal",
  });

  return NextResponse.json(result);
}
