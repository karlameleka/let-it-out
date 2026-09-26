import { Suspense } from "react";
import DateRangePicker from "@/components/date-range-picker";
import { resolveDateRange } from "@/lib/date-range";
import { formatEGP } from "@/lib/format";
import {
  getStickiness,
  getFeatureAdoptionDepth,
  getTimeToValue,
  getRetention,
  getAarrrFunnel,
  getHeartScorecard,
} from "@/lib/behavioral-metrics";

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5">
      <h3 className="font-display font-semibold text-brand-900">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-ink/50">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ChangeBadge({ change }: { change: number | null }) {
  if (change === null) return <span className="text-ink/35">No prior data</span>;
  const isUp = change > 0;
  const isDown = change < 0;
  return (
    <span className={isUp ? "text-[#0ca30c]" : isDown ? "text-[#d03b3b]" : "text-ink/40"}>
      {change > 0 ? "+" : ""}
      {change}% vs. prior period
    </span>
  );
}

function StatTile({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5">
      <p className="font-display text-3xl font-semibold text-brand-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-ink/70">{label}</p>
      {sublabel && <p className="mt-0.5 text-xs text-ink/45">{sublabel}</p>}
    </div>
  );
}

function BarList({
  rows,
  formatValue,
  emptyLabel,
}: {
  rows: { label: string; value: number; sublabel?: string }[];
  formatValue: (v: number) => string;
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
              {formatValue(r.value)}
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

function DauSparkline({ trend }: { trend: { date: string; dau: number }[] }) {
  const max = Math.max(1, ...trend.map((t) => t.dau));
  return (
    <div className="flex h-16 items-end gap-1">
      {trend.map((t) => (
        <div key={t.date} className="group relative flex-1">
          <div
            className="rounded-t bg-brand-400"
            style={{ height: `${Math.max(3, (t.dau / max) * 64)}px` }}
            title={`${t.date}: ${t.dau} active`}
          />
        </div>
      ))}
    </div>
  );
}

export default async function BehavioralAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const range = resolveDateRange(sp);

  const [stickiness, featureAdoption, ttv, retention] = await Promise.all([
    getStickiness(),
    getFeatureAdoptionDepth(),
    getTimeToValue(),
    getRetention(),
  ]);
  const [aarrr, heart] = await Promise.all([
    getAarrrFunnel(range, retention),
    getHeartScorecard(range, retention, featureAdoption),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-xl font-semibold text-brand-900">Behavioral analytics</h1>
        <p className="mt-1 text-sm text-ink/60">
          AARRR funnel, Google HEART framework, and stickiness/adoption/time-to-value — built on the
          object-action event log (see AnalyticsEvent), which only started recording when this page shipped. Staff
          accounts are excluded from every number below.
        </p>
        <div className="mt-4">
          <Suspense fallback={<div className="h-8" />}>
            <DateRangePicker />
          </Suspense>
        </div>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-brand-900">Core behavioral metrics</h2>
        <p className="mt-1 text-sm text-ink/60">
          Stickiness (DAU/MAU), how deeply people explore the product, and how fast they get to a real payoff.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Stickiness (DAU / MAU)"
            value={stickiness.stickinessPct !== null ? `${stickiness.stickinessPct}%` : "—"}
            sublabel={`${stickiness.dau} today of ${stickiness.mau} in the last 30 days`}
          />
          <StatTile
            label="Feature adoption depth"
            value={`${featureAdoption.avgFeaturesAdopted} / ${featureAdoption.totalCoreFeatures}`}
            sublabel="Avg. core features tried per user"
          />
          <StatTile
            label="Time-to-value (median)"
            value={ttv.medianHours !== null ? formatHours(ttv.medianHours) : "—"}
            sublabel={`${ttv.reachedPct}% of users reached a value moment (${ttv.usersReached}/${ttv.totalUsers})`}
          />
          <StatTile
            label="30-day retention"
            value={`${retention.retainedPct}%`}
            sublabel={`${retention.retainedCount} of ${retention.eligibleCount} eligible users still active`}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Daily active users" subtitle="Trailing 14 days, staff excluded">
            <DauSparkline trend={stickiness.trend} />
          </Panel>
          <Panel
            title="Feature adoption distribution"
            subtitle={`How many of the ${featureAdoption.totalCoreFeatures} core features each user has tried, ever`}
          >
            <BarList
              rows={featureAdoption.distribution.map((d) => ({
                label: `${d.featuresAdopted} feature${d.featuresAdopted === 1 ? "" : "s"}`,
                value: d.users,
                sublabel: `${d.pct}%`,
              }))}
              formatValue={(v) => `${v} user${v === 1 ? "" : "s"}`}
              emptyLabel="No users yet."
            />
          </Panel>
        </div>

        <div className="mt-4">
          <Panel title="Adoption by feature" subtitle="Share of all registered users who've ever opened each one">
            <BarList
              rows={featureAdoption.perFeature.map((f) => ({ label: f.label, value: f.users, sublabel: `${f.pct}%` }))}
              formatValue={(v) => `${v} user${v === 1 ? "" : "s"}`}
              emptyLabel="No page views recorded yet."
            />
          </Panel>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-brand-900">AARRR (Pirate Metrics) funnel</h2>
        <p className="mt-1 text-sm text-ink/60">
          Acquisition → Activation → Retention → Referral → Revenue, for the selected range (Retention is a
          point-in-time snapshot, not range-scoped).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Acquisition</p>
            <p className="mt-2 font-display text-2xl font-semibold text-brand-900">{aarrr.acquisition.count}</p>
            <p className="mt-1 text-xs text-ink/50">New signups</p>
            <p className="mt-2 text-xs font-medium">
              <ChangeBadge change={aarrr.acquisition.change} />
            </p>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Activation</p>
            <p className="mt-2 font-display text-2xl font-semibold text-brand-900">{aarrr.activation.activatedPct}%</p>
            <p className="mt-1 text-xs text-ink/50">
              {aarrr.activation.activatedCount} of {aarrr.activation.signupCount} reached value within 7 days
            </p>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Retention</p>
            <p className="mt-2 font-display text-2xl font-semibold text-brand-900">{aarrr.retention.retainedPct}%</p>
            <p className="mt-1 text-xs text-ink/50">Active 30d+ after signing up</p>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Referral</p>
            <p className="mt-2 font-display text-2xl font-semibold text-brand-900">{aarrr.referral.count}</p>
            <p className="mt-1 text-xs text-ink/50">Invite codes activated</p>
            <p className="mt-2 text-xs font-medium">
              <ChangeBadge change={aarrr.referral.change} />
            </p>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Revenue</p>
            <p className="mt-2 font-display text-2xl font-semibold text-brand-900">{formatEGP(aarrr.revenue.totalEGP)}</p>
            <p className="mt-1 text-xs text-ink/50">Confirmed shop + session payments</p>
            <p className="mt-2 text-xs font-medium">
              <ChangeBadge change={aarrr.revenue.change} />
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-brand-900">Google HEART framework</h2>
        <p className="mt-1 text-sm text-ink/60">
          Happiness, Engagement, Adoption, Retention, Task success — for the selected range.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Happiness</p>
            <p className="mt-2 font-display text-2xl font-semibold text-brand-900">
              {heart.happiness.avgRating !== null ? `${heart.happiness.avgRating} / 5` : "—"}
            </p>
            <p className="mt-1 text-xs text-ink/50">
              {heart.happiness.responseCount} feedback submission{heart.happiness.responseCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Engagement</p>
            <p className="mt-2 font-display text-2xl font-semibold text-brand-900">{heart.engagement.avgEventsPerActiveUser}</p>
            <p className="mt-1 text-xs text-ink/50">Avg. tracked actions per active user</p>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Adoption</p>
            <p className="mt-2 font-display text-2xl font-semibold text-brand-900">{heart.adoption.pctAdoptedAtLeastOne}%</p>
            <p className="mt-1 text-xs text-ink/50">Tried at least one core feature, ever</p>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Retention</p>
            <p className="mt-2 font-display text-2xl font-semibold text-brand-900">{heart.retention.retainedPct}%</p>
            <p className="mt-1 text-xs text-ink/50">Active 30d+ after signing up</p>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Task success</p>
            <p className="mt-2 font-display text-2xl font-semibold text-brand-900">
              {heart.taskSuccess.bookingConfirmRate !== null ? `${heart.taskSuccess.bookingConfirmRate}%` : "—"}
            </p>
            <p className="mt-1 text-xs text-ink/50">
              Bookings confirmed
              {heart.taskSuccess.assessmentCompletionRate !== null
                ? ` · ${heart.taskSuccess.assessmentCompletionRate}% assessments completed`
                : ""}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 48) return `${Math.round(hours * 10) / 10} hr`;
  return `${Math.round((hours / 24) * 10) / 10} days`;
}
