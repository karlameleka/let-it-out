import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushToEmails } from "@/lib/web-push";
import { tomorrowISO } from "@/lib/therapist-data";
import { getSiteSettings } from "@/lib/site-settings";
import { isScheduledHourNow } from "@/lib/cron-schedule";

export async function GET(req: NextRequest) {
  // Same fail-closed auth pattern as the journal-reminder cron — this
  // endpoint fans out push notifications, so an unset secret must refuse
  // the request rather than leave it open to anyone who finds the URL.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/session-reminders] CRON_SECRET is not configured — refusing to run.");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "Web push is not configured." }, { status: 503 });
  }

  // This runs hourly (see vercel.json) rather than once a day, so the send
  // hour can be changed from /admin/notifications without a redeploy —
  // only actually send during the hour an admin configured. (Bookings
  // still only get one reminder ever, via reminderSentAt below, regardless
  // of how often this route is invoked.)
  const { sessionReminderHour } = await getSiteSettings();
  if (!isScheduledHourNow(sessionReminderHour)) {
    return NextResponse.json({ skipped: true, reason: "not the scheduled hour" });
  }

  const tomorrow = tomorrowISO();

  const [sessions, requests] = await Promise.all([
    prisma.sessionBooking.findMany({
      where: { status: "CONFIRMED", preferredDate: tomorrow, reminderSentAt: null },
      select: { id: true, email: true },
    }),
    prisma.bookingRequest.findMany({
      where: { status: "CONFIRMED", preferredDate: tomorrow, reminderSentAt: null },
      select: { id: true, email: true },
    }),
  ]);

  const bookingCount = sessions.length + requests.length;
  if (bookingCount === 0) {
    return NextResponse.json({ sent: 0, removed: 0, total: 0, bookings: 0 });
  }

  const emails = [...new Set([...sessions, ...requests].map((b) => b.email))];

  // One shared notification covering everyone with a session tomorrow —
  // the exact time varies per booking, so it's left out of the shared
  // copy and clients see it on /upcoming after tapping through.
  const result = await sendPushToEmails(emails, {
    title: "Session tomorrow",
    body: "You have a counseling session coming up tomorrow — tap for the details.",
    url: "/upcoming",
  });

  await Promise.all([
    prisma.sessionBooking.updateMany({
      where: { id: { in: sessions.map((s) => s.id) } },
      data: { reminderSentAt: new Date() },
    }),
    prisma.bookingRequest.updateMany({
      where: { id: { in: requests.map((r) => r.id) } },
      data: { reminderSentAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ...result, bookings: bookingCount });
}
