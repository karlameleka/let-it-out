import "server-only";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/anti-spam";
import type { Prisma } from "@/generated/prisma/client";

export type AuditSeverity = "INFO" | "WARNING" | "SECURITY";

/**
 * Records one row to the permanent admin activity trail — the source for
 * both the Audit Logs page (full history) and the Notification Center (a
 * curated feed of the same rows). Fire-and-forget by design: an audit-log
 * write failing (e.g. a transient DB hiccup) must never break the actual
 * admin action it's describing, so every call site should call this
 * without awaiting its rejection path — see logAudit's own try/catch
 * below, which already swallows errors and only logs them to the server
 * console.
 *
 * `actor` is omitted for system/cron-originated entries (a scheduled push
 * job completing has no human actor). When provided, actorEmail is
 * snapshotted now — see the AuditLog model comment for why.
 */
export async function logAudit(entry: {
  actor?: { userId: string; email: string } | null;
  action: string;
  summary: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  severity?: AuditSeverity;
  /** Skips the request-scoped IP lookup — only needed outside a request
   * context (e.g. a cron route already has its own auth check and no
   * meaningful "client" IP beyond the scheduler calling it). */
  skipIp?: boolean;
}): Promise<void> {
  try {
    const ip = entry.skipIp ? null : await getClientIp().catch(() => null);
    await prisma.auditLog.create({
      data: {
        actorId: entry.actor?.userId ?? null,
        actorEmail: entry.actor?.email ?? null,
        action: entry.action,
        summary: entry.summary,
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        metadata: (entry.metadata as Prisma.InputJsonValue | undefined) ?? undefined,
        severity: entry.severity ?? "INFO",
        ip,
      },
    });
  } catch (err) {
    // Never let a logging failure surface to the admin as if their actual
    // action (the order they updated, the product they deleted) failed.
    console.error("[audit-log] Failed to write entry:", entry.action, err);
  }
}
