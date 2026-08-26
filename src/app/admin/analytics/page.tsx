import { getUserCountStats, getDemographics, getFeatureUsage, getTimeSpentByGroup } from "@/lib/analytics";
import type { BreakdownRow, TimeSpentRow } from "@/lib/analytics";

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

function demographicRows(rows: BreakdownRow[]) {
  return rows.map((r) => ({ label: r.label, value: r.count, sublabel: `${r.pct}%` }));
}

function timeSpentRows(rows: TimeSpentRow[]) {
  return rows.map((r) => ({
    label: r.label,
    value: r.avgMinutes,
    sublabel: `${r.sessions} session${r.sessions === 1 ? "" : "s"}`,
  }));
}

export default async function AdminAnalyticsPage() {
  const [userStats, demographics, featureUsage, timeSpent] = await Promise.all([
    getUserCountStats(),
    getDemographics(),
    getFeatureUsage(),
    getTimeSpentByGroup(),
  ]);

  const mostUsed = featureUsage.features[0];
  const leastUsed = featureUsage.features[featureUsage.features.length - 1];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total users", value: userStats.total },
          { label: "New users (last 30 days)", value: userStats.newLast30 },
          {
            label: "Journal lock enabled",
            value: userStats.total ? `${Math.round((userStats.withLockEnabled / userStats.total) * 100)}%` : "—",
          },
          { label: "Page views tracked", value: featureUsage.total },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-brand-100 bg-white p-6">
            <p className="font-display text-3xl font-semibold text-brand-800">{c.value}</p>
            <p className="mt-1 text-sm text-ink/60">{c.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-brand-900">Demographics</h2>
        <p className="mt-1 text-sm text-ink/60">Based on {demographics.total} account{demographics.total === 1 ? "" : "s"} — collected once at signup.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="Gender">
            <BarList rows={demographicRows(demographics.gender)} formatValue={(v) => String(v)} emptyLabel="No accounts yet." />
          </Panel>
          <Panel title="Age">
            <BarList rows={demographicRows(demographics.age)} formatValue={(v) => String(v)} emptyLabel="No accounts yet." />
          </Panel>
          <Panel title="Country" subtitle="Top 6, everything else grouped as Other">
            <BarList rows={demographicRows(demographics.country)} formatValue={(v) => String(v)} emptyLabel="No accounts yet." />
          </Panel>
          <Panel title="How they heard about us">
            <BarList rows={demographicRows(demographics.referral)} formatValue={(v) => String(v)} emptyLabel="No accounts yet." />
          </Panel>
          <Panel title="What they're interested in" subtitle="Multi-select at signup — percentages are share of users, not mutually exclusive" >
            <BarList rows={demographicRows(demographics.interests)} formatValue={(v) => String(v)} emptyLabel="No accounts yet." />
          </Panel>
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-brand-900">Most / least used features</h2>
        <p className="mt-1 text-sm text-ink/60">
          Based on pages opened by logged-in users since this tracking shipped — anonymous visits and journal entry
          content are never recorded.
        </p>
        <div className="mt-4 rounded-2xl border border-brand-100 bg-white p-5">
          {featureUsage.features.length === 0 ? (
            <p className="text-sm text-ink/50">
              No page views recorded yet — this fills in as people use the app going forward.
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2 text-xs">
                {mostUsed && (
                  <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700">
                    Most used: {mostUsed.label}
                  </span>
                )}
                {leastUsed && leastUsed.label !== mostUsed?.label && (
                  <span className="rounded-full bg-ink/5 px-3 py-1 font-medium text-ink/50">
                    Least used: {leastUsed.label}
                  </span>
                )}
              </div>
              <BarList
                rows={featureUsage.features.map((f) => ({ label: f.label, value: f.views, sublabel: `${f.users} user${f.users === 1 ? "" : "s"}` }))}
                formatValue={(v) => `${v} view${v === 1 ? "" : "s"}`}
                emptyLabel="No page views recorded yet."
              />
            </>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-brand-900">Average time spent per group</h2>
        <p className="mt-1 text-sm text-ink/60">
          Average session length in minutes, estimated from pageview timestamps (a new session starts after 30
          minutes of inactivity){timeSpent.trackedUsers > 0 ? ` — based on ${timeSpent.trackedUsers} tracked user${timeSpent.trackedUsers === 1 ? "" : "s"}.` : "."}
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel title="By gender">
            <BarList rows={timeSpentRows(timeSpent.gender)} formatValue={(v) => `${v} min`} emptyLabel="No session data yet." />
          </Panel>
          <Panel title="By age">
            <BarList rows={timeSpentRows(timeSpent.age)} formatValue={(v) => `${v} min`} emptyLabel="No session data yet." />
          </Panel>
          <Panel title="By how they heard about us">
            <BarList rows={timeSpentRows(timeSpent.referral)} formatValue={(v) => `${v} min`} emptyLabel="No session data yet." />
          </Panel>
        </div>
      </div>
    </div>
  );
}
