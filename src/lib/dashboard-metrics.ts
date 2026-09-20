import "server-only";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@/generated/prisma/enums";
import { priorPeriod, percentChange, type DateRange } from "@/lib/date-range";

// Orders/bookings only count toward revenue once payment is actually
// confirmed — PENDING_PAYMENT/PAYMENT_SUBMITTED/CANCELLED never happened
// as far as the business is concerned.
const PAID_ORDER_STATUSES: OrderStatus[] = [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.COMPLETED];

export type KpiMetric = {
  key: string;
  label: string;
  value: number;
  /** How to render `value` (and `prevValue`) — EGP currency, a plain
   * count, or a percentage point already. */
  format: "currency" | "number";
  /** Percent change vs. the prior period of equal length — null when the
   * prior period had a zero baseline (no meaningful percent to show). */
  change: number | null;
  prevValue: number;
};

/** Exported for reuse by behavioral-metrics.ts (AARRR's Revenue stage) —
 * same "what counts as revenue" definition (only confirmed payments) used
 * in both places. */
export async function revenueForRange(range: DateRange): Promise<{ shopEGP: number; sessionsEGP: number }> {
  const [orders, sessions] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: PAID_ORDER_STATUSES }, createdAt: { gte: range.from, lte: range.to } },
      _sum: { totalEGP: true },
    }),
    prisma.sessionBooking.findMany({
      where: { status: "CONFIRMED", createdAt: { gte: range.from, lte: range.to } },
      select: { priceEGP: true, discountEGP: true },
    }),
  ]);
  const sessionsEGP = sessions.reduce((sum, s) => sum + (s.priceEGP - s.discountEGP), 0);
  return { shopEGP: orders._sum.totalEGP ?? 0, sessionsEGP };
}

async function activeUserCount(range: DateRange): Promise<number> {
  const rows = await prisma.pageView.findMany({
    where: { createdAt: { gte: range.from, lte: range.to } },
    select: { userId: true },
    distinct: ["userId"],
  });
  return rows.length;
}

function metric(key: string, label: string, format: "currency" | "number", value: number, prevValue: number): KpiMetric {
  return { key, label, format, value, prevValue, change: percentChange(value, prevValue) };
}

/** The Overview page's scorecard row — revenue, active users, signups, and
 * booking volume for the selected range, each carrying its own vs-prior-
 * period trend. Every figure is computed twice (current range, then the
 * immediately preceding range of equal length via priorPeriod()) rather
 * than once with a stored snapshot, since date ranges here are ad hoc
 * (whatever the admin picked), not fixed calendar months. */
export async function getDashboardKpis(range: DateRange): Promise<KpiMetric[]> {
  const prev = priorPeriod(range);

  const [
    { shopEGP, sessionsEGP },
    { shopEGP: prevShopEGP, sessionsEGP: prevSessionsEGP },
    activeUsers,
    prevActiveUsers,
    newSignups,
    prevNewSignups,
    newOrders,
    prevNewOrders,
    newSessionBookings,
    prevNewSessionBookings,
  ] = await Promise.all([
    revenueForRange(range),
    revenueForRange(prev),
    activeUserCount(range),
    activeUserCount(prev),
    prisma.user.count({ where: { role: "USER", createdAt: { gte: range.from, lte: range.to } } }),
    prisma.user.count({ where: { role: "USER", createdAt: { gte: prev.from, lte: prev.to } } }),
    prisma.order.count({ where: { createdAt: { gte: range.from, lte: range.to } } }),
    prisma.order.count({ where: { createdAt: { gte: prev.from, lte: prev.to } } }),
    prisma.sessionBooking.count({ where: { status: "CONFIRMED", createdAt: { gte: range.from, lte: range.to } } }),
    prisma.sessionBooking.count({ where: { status: "CONFIRMED", createdAt: { gte: prev.from, lte: prev.to } } }),
  ]);

  const totalRevenue = shopEGP + sessionsEGP;
  const prevTotalRevenue = prevShopEGP + prevSessionsEGP;

  return [
    metric("revenue", "Total revenue", "currency", totalRevenue, prevTotalRevenue),
    metric("active_users", "Active users", "number", activeUsers, prevActiveUsers),
    metric("new_signups", "New signups", "number", newSignups, prevNewSignups),
    metric("orders", "Shop orders", "number", newOrders, prevNewOrders),
    metric("session_bookings", "Confirmed sessions", "number", newSessionBookings, prevNewSessionBookings),
  ];
}

export type RevenuePoint = { date: string; shop: number; sessions: number; total: number };

/** Daily revenue series for the line chart — shop and session revenue kept
 * separate (stacked in the chart) as well as summed, since "where is
 * revenue actually coming from" is exactly the kind of thing a line chart
 * should make visible at a glance. */
export async function getRevenueSeries(range: DateRange): Promise<RevenuePoint[]> {
  const [orders, sessions] = await Promise.all([
    prisma.order.findMany({
      where: { status: { in: PAID_ORDER_STATUSES }, createdAt: { gte: range.from, lte: range.to } },
      select: { createdAt: true, totalEGP: true },
    }),
    prisma.sessionBooking.findMany({
      where: { status: "CONFIRMED", createdAt: { gte: range.from, lte: range.to } },
      select: { createdAt: true, priceEGP: true, discountEGP: true },
    }),
  ]);

  const byDate = new Map<string, { shop: number; sessions: number }>();
  const dayMs = 24 * 60 * 60 * 1000;
  for (let t = range.from.getTime(); t <= range.to.getTime(); t += dayMs) {
    byDate.set(new Date(t).toISOString().slice(0, 10), { shop: 0, sessions: 0 });
  }
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    const entry = byDate.get(key);
    if (entry) entry.shop += o.totalEGP;
  }
  for (const s of sessions) {
    const key = s.createdAt.toISOString().slice(0, 10);
    const entry = byDate.get(key);
    if (entry) entry.sessions += s.priceEGP - s.discountEGP;
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, shop: v.shop, sessions: v.sessions, total: v.shop + v.sessions }));
}

export type StatusCount = { status: string; count: number };

/** Order status breakdown for the bar chart — every status, not just the
 * "needs attention" subset the Overview page's queue cards already cover,
 * so the chart reads as a full funnel (pending → confirmed/shipped →
 * completed, with cancelled alongside). */
export async function getOrdersByStatus(range: DateRange): Promise<StatusCount[]> {
  const rows = await prisma.order.groupBy({
    by: ["status"],
    where: { createdAt: { gte: range.from, lte: range.to } },
    _count: { _all: true },
  });
  const order = ["PENDING_PAYMENT", "PAYMENT_SUBMITTED", "CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"];
  return rows
    .map((r) => ({ status: r.status, count: r._count._all }))
    .sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
}

export type ActivityHeatmapCell = { day: number; hour: number; count: number };

/** Page-view activity by day-of-week × hour — the "when are people
 * actually using the app" heatmap. Day 0 = Sunday, hour in UTC (this app
 * doesn't track a per-request timezone; see date-range.ts for the same
 * UTC-everywhere convention used across the dashboard). */
export async function getActivityHeatmap(range: DateRange): Promise<ActivityHeatmapCell[]> {
  const views = await prisma.pageView.findMany({
    where: { createdAt: { gte: range.from, lte: range.to } },
    select: { createdAt: true },
  });

  const counts = new Map<string, number>();
  for (const v of views) {
    const day = v.createdAt.getUTCDay();
    const hour = v.createdAt.getUTCHours();
    const key = `${day}-${hour}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const cells: ActivityHeatmapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      cells.push({ day, hour, count: counts.get(`${day}-${hour}`) ?? 0 });
    }
  }
  return cells;
}
