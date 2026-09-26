"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatEGP } from "@/lib/format";
import type { RevenuePoint } from "@/lib/dashboard-metrics";

// Categorical slots 1 (blue) and 2 (orange) from the validated palette —
// see the dataviz skill's palette.md. Kept as the literal hexes (not a
// Tailwind token) since these two colors are reserved for "shop" vs
// "session" revenue specifically and shouldn't drift if the brand ramp
// changes elsewhere in the app.
const SHOP_COLOR = "#2a78d6";
const SESSIONS_COLOR = "#eb6834";

function formatDateLabel(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

function TooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const total = payload.reduce((sum, p) => sum + p.value, 0);
  return (
    <div className="rounded-xl border border-brand-100 bg-white p-3 text-xs shadow-lg">
      <p className="font-medium text-ink/80">{label ? formatDateLabel(label) : ""}</p>
      {payload.map((p) => (
        <p key={p.name} className="mt-1 flex items-center gap-1.5" style={{ color: p.color }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-ink/70">{p.name}:</span> {formatEGP(p.value)}
        </p>
      ))}
      <p className="mt-1 border-t border-brand-50 pt-1 font-medium text-ink/80">Total: {formatEGP(total)}</p>
    </div>
  );
}

export default function RevenueChart({ data }: { data: RevenuePoint[] }) {
  if (data.every((d) => d.total === 0)) {
    return <p className="flex h-64 items-center justify-center text-sm text-ink/45">No revenue in this range yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateLabel}
          tick={{ fontSize: 11, fill: "#12354399" }}
          axisLine={{ stroke: "#c3c2b7" }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
          tick={{ fontSize: 11, fill: "#12354399" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<TooltipContent />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          dataKey="shop"
          name="Shop"
          stackId="1"
          stroke={SHOP_COLOR}
          fill={SHOP_COLOR}
          fillOpacity={0.18}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="sessions"
          name="Sessions"
          stackId="1"
          stroke={SESSIONS_COLOR}
          fill={SESSIONS_COLOR}
          fillOpacity={0.18}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
