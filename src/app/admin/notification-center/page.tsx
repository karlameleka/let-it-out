import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import NotificationCenterList from "./notification-center-list";

const LOOKBACK_DAYS = 30;

export type FeedCategory = "security" | "system" | "background" | "other";

function categorize(action: string, severity: string): FeedCategory {
  if (severity === "SECURITY") return "security";
  if (action.startsWith("cron.")) return "background";
  if (action.startsWith("admin.")) return "security";
  return "system";
}

export default async function AdminNotificationCenterPage() {
  const admin = await getCurrentUser();
  const now = new Date();
  const since = new Date(now.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

  const entries = await prisma.auditLog.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const itemIds = entries.map((e) => `audit-${e.id}`);
  const reads = admin
    ? await prisma.notificationRead.findMany({
        where: { userId: admin.userId, itemId: { in: itemIds } },
      })
    : [];
  const readIds = new Set(reads.filter((r) => !r.dismissed).map((r) => r.itemId));
  const dismissedIds = new Set(reads.filter((r) => r.dismissed).map((r) => r.itemId));

  const items = entries
    .filter((e) => !dismissedIds.has(`audit-${e.id}`))
    .map((e) => ({
      id: e.id,
      itemId: `audit-${e.id}`,
      summary: e.summary,
      action: e.action,
      actorEmail: e.actorEmail,
      severity: e.severity,
      category: categorize(e.action, e.severity),
      createdAt: e.createdAt.toISOString(),
      read: readIds.has(`audit-${e.id}`),
    }));

  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink/60">
        {unreadCount > 0
          ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"} from the last ${LOOKBACK_DAYS} days.`
          : `You're caught up — nothing unread from the last ${LOOKBACK_DAYS} days.`}
      </p>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-brand-100 bg-white p-6 text-sm text-ink/50">
          Nothing to show yet — this fills in as admin activity happens.
        </p>
      ) : (
        <NotificationCenterList items={items} />
      )}
    </div>
  );
}
