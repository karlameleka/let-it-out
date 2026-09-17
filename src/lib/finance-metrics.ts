import "server-only";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@/generated/prisma/enums";
import type { DateRange } from "@/lib/date-range";

const PAID_ORDER_STATUSES: OrderStatus[] = [OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.COMPLETED];
// "Realized" revenue only counts a completed sale. A pending/unconfirmed
// order or session isn't revenue yet — it's shown separately as
// "outstanding" (a payment funnel figure, not income).
const PENDING_ORDER_STATUSES: OrderStatus[] = [OrderStatus.PENDING_PAYMENT, OrderStatus.PAYMENT_SUBMITTED];

export type FinanceSummary = {
  shopRevenueEGP: number;
  sessionsRevenueEGP: number;
  totalRevenueEGP: number;
  shopOrderCount: number;
  confirmedSessionCount: number;
  averageOrderValueEGP: number;
  averageSessionValueEGP: number;
  discountsGivenEGP: number;
  shippingCollectedEGP: number;
  outstandingEGP: number;
  outstandingOrderCount: number;
};

/** The finance page's headline numbers for the selected range — every
 * figure realized (paid/confirmed) unless explicitly labeled
 * "outstanding". Shares PAID_ORDER_STATUSES with dashboard-metrics.ts's
 * revenueForRange by definition (both mean "actually got paid"), kept as
 * a separate literal here rather than imported since the two modules are
 * meant to be readable independently — this one is finance-specific,
 * that one is the general KPI scorecard row. */
export async function getFinanceSummary(range: DateRange): Promise<FinanceSummary> {
  const [orders, pendingOrders, sessions] = await Promise.all([
    prisma.order.findMany({
      where: { status: { in: PAID_ORDER_STATUSES }, createdAt: { gte: range.from, lte: range.to } },
      select: { totalEGP: true, discountEGP: true, shippingFeeEGP: true },
    }),
    prisma.order.findMany({
      where: { status: { in: PENDING_ORDER_STATUSES }, createdAt: { gte: range.from, lte: range.to } },
      select: { totalEGP: true },
    }),
    prisma.sessionBooking.findMany({
      where: { status: "CONFIRMED", createdAt: { gte: range.from, lte: range.to } },
      select: { priceEGP: true, discountEGP: true },
    }),
  ]);

  const shopRevenueEGP = orders.reduce((sum, o) => sum + o.totalEGP, 0);
  const sessionsRevenueEGP = sessions.reduce((sum, s) => sum + (s.priceEGP - s.discountEGP), 0);
  const discountsGivenEGP =
    orders.reduce((sum, o) => sum + o.discountEGP, 0) + sessions.reduce((sum, s) => sum + s.discountEGP, 0);
  const shippingCollectedEGP = orders.reduce((sum, o) => sum + o.shippingFeeEGP, 0);
  const outstandingEGP = pendingOrders.reduce((sum, o) => sum + o.totalEGP, 0);

  return {
    shopRevenueEGP,
    sessionsRevenueEGP,
    totalRevenueEGP: shopRevenueEGP + sessionsRevenueEGP,
    shopOrderCount: orders.length,
    confirmedSessionCount: sessions.length,
    averageOrderValueEGP: orders.length ? Math.round(shopRevenueEGP / orders.length) : 0,
    averageSessionValueEGP: sessions.length ? Math.round(sessionsRevenueEGP / sessions.length) : 0,
    discountsGivenEGP,
    shippingCollectedEGP,
    outstandingEGP,
    outstandingOrderCount: pendingOrders.length,
  };
}

export type PaymentMethodBreakdown = { method: string; revenueEGP: number; count: number };

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  INSTAPAY: "InstaPay",
  CASH_ON_DELIVERY: "Cash on Delivery",
  PAYMOB: "Card / Wallet (Paymob)",
};

/** Shop revenue split by how it was paid. Sessions aren't included — the
 * in-app booking flow only ever charges through Paymob, so a method
 * breakdown there would always be a single 100% bar. */
export async function getRevenueByPaymentMethod(range: DateRange): Promise<PaymentMethodBreakdown[]> {
  const rows = await prisma.order.groupBy({
    by: ["paymentMethod"],
    where: { status: { in: PAID_ORDER_STATUSES }, createdAt: { gte: range.from, lte: range.to } },
    _sum: { totalEGP: true },
    _count: { _all: true },
  });
  return rows
    .map((r) => ({
      method: PAYMENT_METHOD_LABEL[r.paymentMethod] ?? r.paymentMethod,
      revenueEGP: r._sum.totalEGP ?? 0,
      count: r._count._all,
    }))
    .sort((a, b) => b.revenueEGP - a.revenueEGP);
}

export type ProductRevenue = { title: string; revenueEGP: number; unitsSold: number };

/** Top products by revenue (unit price x quantity, from each order's line
 * items) — only counted from orders that actually got paid, same
 * PAID_ORDER_STATUSES gate as everything else here. */
export async function getRevenueByProduct(range: DateRange, limit = 10): Promise<ProductRevenue[]> {
  const items = await prisma.orderItem.findMany({
    where: {
      order: { status: { in: PAID_ORDER_STATUSES }, createdAt: { gte: range.from, lte: range.to } },
    },
    select: { titleSnapshot: true, unitPriceEGP: true, quantity: true },
  });

  const byTitle = new Map<string, { revenueEGP: number; unitsSold: number }>();
  for (const item of items) {
    const entry = byTitle.get(item.titleSnapshot) ?? { revenueEGP: 0, unitsSold: 0 };
    entry.revenueEGP += item.unitPriceEGP * item.quantity;
    entry.unitsSold += item.quantity;
    byTitle.set(item.titleSnapshot, entry);
  }

  return [...byTitle.entries()]
    .map(([title, v]) => ({ title, ...v }))
    .sort((a, b) => b.revenueEGP - a.revenueEGP)
    .slice(0, limit);
}

export type CounselorRevenue = { name: string; revenueEGP: number; sessionCount: number };

/** Confirmed session revenue by counselor — who the bookings are actually
 * coming from, for the finance page's session-side breakdown. */
export async function getRevenueByCounselor(range: DateRange, limit = 10): Promise<CounselorRevenue[]> {
  const sessions = await prisma.sessionBooking.findMany({
    where: { status: "CONFIRMED", createdAt: { gte: range.from, lte: range.to } },
    select: { priceEGP: true, discountEGP: true, counselor: { select: { name: true } } },
  });

  const byCounselor = new Map<string, { revenueEGP: number; sessionCount: number }>();
  for (const s of sessions) {
    const entry = byCounselor.get(s.counselor.name) ?? { revenueEGP: 0, sessionCount: 0 };
    entry.revenueEGP += s.priceEGP - s.discountEGP;
    entry.sessionCount += 1;
    byCounselor.set(s.counselor.name, entry);
  }

  return [...byCounselor.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenueEGP - a.revenueEGP)
    .slice(0, limit);
}
