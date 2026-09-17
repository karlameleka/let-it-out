import { NextResponse, type NextRequest } from "next/server";
import { purgeExpiredTrash } from "@/lib/trash";
import { logAudit } from "@/lib/audit-log";

/**
 * Hard-deletes every TrashedItem past its 24h undo window (see
 * src/lib/trash.ts) — runs hourly (see vercel.json) so nothing sits
 * restorable much past the 24h it promises. Same fail-closed auth as the
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

  const purged = await purgeExpiredTrash();
  if (purged > 0) {
    await logAudit({
      skipIp: true,
      action: "cron.trash_purge",
      summary: `Purged ${purged} expired trash item${purged === 1 ? "" : "s"}`,
      metadata: { purged },
    });
  }

  return NextResponse.json({ purged });
}
