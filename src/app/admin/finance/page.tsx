import { Suspense } from "react";
import DateRangePicker from "@/components/date-range-picker";
import ExportButtons from "@/components/export-buttons";
import ConfirmSubmitButton from "@/components/confirm-submit-button";
import { resolveDateRange, priorPeriod } from "@/lib/date-range";
import { percentChange } from "@/lib/date-range";
import { formatEGP } from "@/lib/format";
import { resetRevenue } from "@/lib/admin-actions";
import {
  getFinanceSummary,
  getRevenueByPaymentMethod,
  getRevenueByProduct,
  getRevenueByCounselor,
  getRevenueResetPreview,
} from "@/lib/finance-metrics";

function StatCard({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5">
      <p className="text-sm font-medium text-ink/60">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-brand-900">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-ink/45">{sublabel}</p>}
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5">
      <h3 className="font-display font-semibold text-brand-900">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-ink/50">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function BarList({
  rows,
  emptyLabel,
}: {
  rows: { label: string; value: number; sublabel?: string }[];
  emptyLabel: string;
}) {
  if (rows.length === 0) return <p className="text-sm text-ink/50">{emptyLabel}</p>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-ink/80">{r.label}</span>
            <span className="shrink-0 font-medium text-ink/50">
              {formatEGP(r.value)}
              {r.sublabel && <span className="ml-1 font-normal text-ink/35">{r.sublabel}</span>}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-brand-50">
            <div className="h-2 rounded-full bg-brand-500" style={{ width: `${Math.max(4, (r.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function AdminFinancePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const range = resolveDateRange(sp);
  const prev = priorPeriod(range);

  const [summary, prevSummary, byPaymentMethod, byProduct, byCounselor, resetPreview] = await Promise.all([
    getFinanceSummary(range),
    getFinanceSummary(prev),
    getRevenueByPaymentMethod(range),
    getRevenueByProduct(range),
    getRevenueByCounselor(range),
    getRevenueResetPreview(),
  ]);

  const revenueChange = percentChange(summary.totalRevenueEGP, prevSummary.totalRevenueEGP);
  const changeLabel =
    revenueChange === null
      ? "No prior data"
      : `${revenueChange > 0 ? "+" : ""}${revenueChange}% vs. prior period`;

  const exportParams: Record<string, string> = {};
  if (sp.from) exportParams.from = sp.from;
  if (sp.to) exportParams.to = sp.to;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-lg font-semibold text-brand-900">Finance</h2>
        <p className="mt-1 text-sm text-ink/60">
          Realized revenue from the shop and confirmed counseling sessions, broken down by source.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Suspense fallback={<div className="h-8" />}>
          <DateRangePicker />
        </Suspense>
        <ExportButtons endpoint="/admin/finance/export" params={exportParams} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total revenue" value={formatEGP(summary.totalRevenueEGP)} sublabel={changeLabel} />
        <StatCard
          label="Shop revenue"
          value={formatEGP(summary.shopRevenueEGP)}
          sublabel={`${summary.shopOrderCount} order${summary.shopOrderCount === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Sessions revenue"
          value={formatEGP(summary.sessionsRevenueEGP)}
          sublabel={`${summary.confirmedSessionCount} session${summary.confirmedSessionCount === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Outstanding"
          value={formatEGP(summary.outstandingEGP)}
          sublabel={`${summary.outstandingOrderCount} order${summary.outstandingOrderCount === 1 ? "" : "s"} pending, not counted as revenue`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Avg. order value" value={formatEGP(summary.averageOrderValueEGP)} />
        <StatCard label="Avg. session value" value={formatEGP(summary.averageSessionValueEGP)} />
        <StatCard label="Discounts given" value={formatEGP(summary.discountsGivenEGP)} />
        <StatCard label="Shipping collected" value={formatEGP(summary.shippingCollectedEGP)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Revenue by payment method" subtitle="Shop orders only — sessions always charge through Paymob.">
          <BarList
            rows={byPaymentMethod.map((r) => ({
              label: r.method,
              value: r.revenueEGP,
              sublabel: `${r.count} order${r.count === 1 ? "" : "s"}`,
            }))}
            emptyLabel="No paid orders in this range."
          />
        </Panel>
        <Panel title="Top products by revenue" subtitle="Top 10, from paid orders' line items.">
          <BarList
            rows={byProduct.map((r) => ({
              label: r.title,
              value: r.revenueEGP,
              sublabel: `${r.unitsSold} sold`,
            }))}
            emptyLabel="No product sales in this range."
          />
        </Panel>
      </div>

      <Panel title="Revenue by counselor" subtitle="Confirmed session revenue, top 10.">
        <BarList
          rows={byCounselor.map((r) => ({
            label: r.name,
            value: r.revenueEGP,
            sublabel: `${r.sessionCount} session${r.sessionCount === 1 ? "" : "s"}`,
          }))}
          emptyLabel="No confirmed sessions in this range."
        />
      </Panel>

      <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5">
        <h2 className="font-display font-semibold text-red-900">Danger zone</h2>
        <p className="mt-1 text-sm text-red-800/80">
          Permanently deletes every paid order and confirmed session booking, all-time (not just the range
          selected above) — right now that&rsquo;s {resetPreview.shopOrderCount} order
          {resetPreview.shopOrderCount === 1 ? "" : "s"} and {resetPreview.confirmedSessionCount} session
          {resetPreview.confirmedSessionCount === 1 ? "" : "s"}, totalling {formatEGP(resetPreview.totalRevenueEGP)}.
          This removes real payment records — customers lose their order confirmation pages. Deleted rows are
          recoverable from Admin &rarr; Recently Deleted for 24 hours, then purged for good. Pending, unconfirmed,
          and cancelled orders/bookings are left untouched.
        </p>
        <form action={resetRevenue} className="mt-3">
          <ConfirmSubmitButton
            confirmMessage={`Permanently delete all ${resetPreview.shopOrderCount} paid orders and ${resetPreview.confirmedSessionCount} confirmed sessions (${formatEGP(resetPreview.totalRevenueEGP)} total)? Recoverable from Recently Deleted for 24h, then gone for good.`}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
          >
            Clear all revenue
          </ConfirmSubmitButton>
        </form>
      </div>
    </div>
  );
}
