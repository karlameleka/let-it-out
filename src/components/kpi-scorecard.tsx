import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { formatEGP } from "@/lib/format";
import type { KpiMetric } from "@/lib/dashboard-metrics";

// Status colors, reserved for trend direction only — never reused as a
// categorical series color elsewhere on the dashboard (see the dataviz
// skill's status-palette rule).
const TREND_UP = "text-[#0ca30c]";
const TREND_DOWN = "text-[#d03b3b]";

function formatValue(metric: KpiMetric): string {
  return metric.format === "currency" ? formatEGP(metric.value) : metric.value.toLocaleString("en-US");
}

export default function KpiScorecard({ metric }: { metric: KpiMetric }) {
  const { change } = metric;
  const isUp = change !== null && change > 0;
  const isDown = change !== null && change < 0;

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5">
      <p className="text-sm font-medium text-ink/60">{metric.label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-brand-900">{formatValue(metric)}</p>
      <div className="mt-2 flex items-center gap-1 text-xs font-medium">
        {change === null ? (
          <span className="inline-flex items-center gap-1 text-ink/40">
            <Minus className="h-3 w-3" strokeWidth={2.5} />
            No prior data
          </span>
        ) : (
          <span className={`inline-flex items-center gap-1 ${isUp ? TREND_UP : isDown ? TREND_DOWN : "text-ink/40"}`}>
            {isUp ? (
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            ) : isDown ? (
              <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            ) : (
              <Minus className="h-3 w-3" strokeWidth={2.5} />
            )}
            {change > 0 ? "+" : ""}
            {change}%
          </span>
        )}
        <span className="text-ink/40">vs. prior period</span>
      </div>
    </div>
  );
}
