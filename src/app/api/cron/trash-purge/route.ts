import { NextResponse, type NextRequest } from "next/server";
import { purgeExpiredTrash } from "@/lib/trash";
import { purgeExpiredCancelledSessions } from "@/lib/upcoming-items";
import { logAudit } from "@/lib/audit-log";

/**
 * Hard-deletes every TrashedItem past its 24h undo window (see
 * src/lib/trash.ts), plus every cancelled SessionBooking/BookingRequest
 * past its CANCELLED_RETENTION_DAYS window (see src/lib/upcoming-items.ts)
 * — bundled into the same daily cron rather than a separate one, since
 * Vercel's Hobby plan rejects the whole deployment past a small number of
 * crons and each can only run once a day. Same fail-closed auth as the
 * other crons in this app.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/trash-purge] CRON_SECRET is not configured — refusing to run.");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [purged, purgedCancelledSessions] = await Promise.all([purgeExpiredTrash(), purgeExpiredCancelledSessions()]);
  if (purged > 0) {
    await logAudit({
      skipIp: true,
      action: "cron.trash_purge",
      summary: `Purged ${purged} expired trash item${purged === 1 ? "" : "s"}`,
      metadata: { purged },
    });
  }
  if (purgedCancelledSessions > 0) {
    await logAudit({
      skipIp: true,
      action: "cron.cancelled_sessions_purge",
      summary: `Purged ${purgedCancelledSessions} expired cancelled session${purgedCancelledSessions === 1 ? "" : "s"}`,
      metadata: { purged: purgedCancelledSessions },
    });
  }

  return NextResponse.json({ purged, purgedCancelledSessions });
}
