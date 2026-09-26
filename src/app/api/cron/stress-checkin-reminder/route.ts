import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushToEmails } from "@/lib/web-push";
import { logAudit } from "@/lib/audit-log";

const CHECKIN_INTERVAL_DAYS = 30;
const MSEC_PER_DAY = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MSEC_PER_DAY);
}

function dateOnlyUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Once a day, finds every client whose 30-day stress check-in lock just
 * lifted — 30 days since their last StressCheckIn.completedAt, or (for a
 * client who's never taken it) their own account creation date — and:
 * creates a StressCheckInPrompt row (both the "already notified this
 * cycle" guard, via its unique constraint on (userId, unlockDate), and the
 * in-app notification shown on /upcoming) and sends a push notification.
 * Same fail-closed auth and best-effort push behavior as the other crons
 * in this file. Runs against every USER-role account since this is a
 * client-facing feature, same scoping as onboarding.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/stress-checkin-reminder] CRON_SECRET is not configured — refusing to run.");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = dateOnlyUTC(new Date());

  const [users, latestByUser] = await Promise.all([
    prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true, email: true, locale: true, createdAt: true },
    }),
    prisma.stressCheckIn.groupBy({
      by: ["userId"],
      _max: { completedAt: true },
    }),
  ]);

  const latestCompletedAtByUserId = new Map(latestByUser.map((r) => [r.userId, r._max.completedAt]));

  const eligible = users
    .map((u) => {
      const last = latestCompletedAtByUserId.get(u.id) ?? null;
      const unlockDate = dateOnlyUTC(last ? addDays(last, CHECKIN_INTERVAL_DAYS) : u.createdAt);
      return { user: u, unlockDate };
    })
    .filter(({ unlockDate }) => unlockDate <= today);

  if (eligible.length === 0) {
    return NextResponse.json({ created: 0, sent: 0, candidates: 0 });
  }

  let created = 0;
  const notified: { email: string; locale: string }[] = [];
  for (const { user, unlockDate } of eligible) {
    try {
      await prisma.stressCheckInPrompt.create({
        data: { userId: user.id, unlockDate },
      });
      created++;
      notified.push({ email: user.email, locale: user.locale });
    } catch {
      // Unique constraint on (userId, unlockDate) — already notified for
      // this cycle by an earlier run, skip silently.
    }
  }

  let sent = 0;
  if (notified.length > 0) {
    const enEmails = notified.filter((u) => u.locale !== "ar").map((u) => u.email);
    const arEmails = notified.filter((u) => u.locale === "ar").map((u) => u.email);

    const [enResult, arResult] = await Promise.all([
      enEmails.length > 0
        ? sendPushToEmails(enEmails, {
            title: "Log your stress-level progress",
            body: "Your monthly stress check-in is ready — it only takes a couple of minutes.",
            url: "/profile/stress-checkin",
          })
        : Promise.resolve({ sent: 0 }),
      arEmails.length > 0
        ? sendPushToEmails(arEmails, {
            title: "سجل مستوى التوتر عندك",
            body: "تسجيل الضغط النفسي الشهري جاهز، بياخد منك دقايق بس.",
            url: "/profile/stress-checkin",
          })
        : Promise.resolve({ sent: 0 }),
    ]);
    sent = enResult.sent + arResult.sent;
  }

  if (created > 0) {
    await logAudit({
      skipIp: true,
      action: "cron.stress_checkin_reminder",
      summary: `Stress check-in reminders: created ${created}, sent to ${sent} subscriber${sent === 1 ? "" : "s"}`,
      metadata: { created, sent, candidates: eligible.length },
    });
  }

  return NextResponse.json({ created, sent, candidates: eligible.length });
}
