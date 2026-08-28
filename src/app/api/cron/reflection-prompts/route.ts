import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendPushToEmails } from "@/lib/web-push";
import { todayISO } from "@/lib/therapist-data";

/**
 * Once a day (after most same-day sessions have concluded — see
 * vercel.json), prompts every client whose confirmed session already
 * happened today or earlier to fill out their private "in-between
 * sessions" reflection sheet: creates a ReflectionPrompt row (both the
 * "already notified" guard, via its unique constraint, and the in-app
 * notification shown on /upcoming) and sends a push notification. Only
 * fires for bookings tied to an actual account — a guest booking with no
 * matching User has nowhere in-app to show this. Same fail-closed auth and
 * best-effort push behavior as the other crons in this file.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/reflection-prompts] CRON_SECRET is not configured — refusing to run.");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = todayISO();

  const [sessions, requests] = await Promise.all([
    prisma.sessionBooking.findMany({
      where: { status: "CONFIRMED", preferredDate: { lte: today } },
      select: { id: true, email: true },
    }),
    prisma.bookingRequest.findMany({
      where: { status: "CONFIRMED", preferredDate: { lte: today } },
      select: { id: true, email: true },
    }),
  ]);

  const candidates = [
    ...sessions.map((s) => ({ sourceKind: "session", sourceId: s.id, email: s.email })),
    ...requests.map((r) => ({ sourceKind: "request", sourceId: r.id, email: r.email })),
  ];
  if (candidates.length === 0) {
    return NextResponse.json({ created: 0, sent: 0, candidates: 0 });
  }

  const alreadyPrompted = await prisma.reflectionPrompt.findMany({
    where: { OR: candidates.map((c) => ({ sourceKind: c.sourceKind, sourceId: c.sourceId })) },
    select: { sourceKind: true, sourceId: true },
  });
  const alreadyPromptedKeys = new Set(alreadyPrompted.map((p) => `${p.sourceKind}:${p.sourceId}`));
  const pending = candidates.filter((c) => !alreadyPromptedKeys.has(`${c.sourceKind}:${c.sourceId}`));
  if (pending.length === 0) {
    return NextResponse.json({ created: 0, sent: 0, candidates: candidates.length });
  }

  const users = await prisma.user.findMany({
    where: { email: { in: [...new Set(pending.map((p) => p.email))] } },
    select: { id: true, email: true, locale: true },
  });
  const userByEmail = new Map(users.map((u) => [u.email, u]));

  let created = 0;
  const notifiedUserIds = new Set<string>();
  for (const c of pending) {
    const user = userByEmail.get(c.email);
    if (!user) continue; // Guest booking, no account to notify.
    try {
      await prisma.reflectionPrompt.create({
        data: { userId: user.id, sourceKind: c.sourceKind, sourceId: c.sourceId },
      });
      created++;
      notifiedUserIds.add(user.id);
    } catch {
      // Unique constraint race (extremely unlikely with a once-daily cron)
      // — already handled by another run, skip silently.
    }
  }

  let sent = 0;
  if (notifiedUserIds.size > 0) {
    const notifiedEmails = users.filter((u) => notifiedUserIds.has(u.id)).map((u) => ({ email: u.email, locale: u.locale }));
    const enEmails = notifiedEmails.filter((u) => u.locale !== "ar").map((u) => u.email);
    const arEmails = notifiedEmails.filter((u) => u.locale === "ar").map((u) => u.email);

    const [enResult, arResult] = await Promise.all([
      enEmails.length > 0
        ? sendPushToEmails(enEmails, {
            title: "Between-session reflection",
            body: "Time for your between-session reflection — a private space just for you.",
            url: "/journal/reflection",
          })
        : Promise.resolve({ sent: 0 }),
      arEmails.length > 0
        ? sendPushToEmails(arEmails, {
            title: "تأمل بين الجلسات",
            body: "وقت تعمل تأملك بين الجلسات — مساحة خاصة ليك بس.",
            url: "/journal/reflection",
          })
        : Promise.resolve({ sent: 0 }),
    ]);
    sent = enResult.sent + arResult.sent;
  }

  return NextResponse.json({ created, sent, candidates: candidates.length });
}
