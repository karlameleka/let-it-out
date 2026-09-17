"use client";

import type { ActivityHeatmapCell } from "@/lib/dashboard-metrics";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Sequential blue ramp (see dataviz skill palette.md) — light-to-dark
// steps, one hue, for a magnitude encoding. Index 0 covers the "0 views"
// cells as a neutral near-white rather than the ramp's own lightest step,
// so an empty hour visually recedes instead of reading as "a little
// activity."
const RAMP = ["#f2f2f0", "#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#0d366b"];

function colorFor(count: number, max: number): string {
  if (count === 0 || max === 0) return RAMP[0];
  const step = Math.min(RAMP.length - 1, Math.ceil((count / max) * (RAMP.length - 1)));
  return RAMP[Math.max(1, step)];
}

function formatHour(hour: number): string {
  if (hour === 0) return "12am";
  if (hour === 12) return "12pm";
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
}

/** Page-view activity by day-of-week × hour (UTC) — a hand-rolled grid
 * (recharts has no heatmap primitive) with a hover tooltip per cell,
 * following the same solid-color-cell pattern as the journal mood
 * calendar elsewhere in this app. */
export default function ActivityHeatmap({ cells }: { cells: ActivityHeatmapCell[] }) {
  const max = Math.max(1, ...cells.map((c) => c.count));
  const byKey = new Map(cells.map((c) => [`${c.day}-${c.hour}`, c.count]));

  if (max === 1 && cells.every((c) => c.count === 0)) {
    return <p className="flex h-40 items-center justify-center text-sm text-ink/45">No activity in this range yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid min-w-full gap-[3px]" style={{ gridTemplateColumns: "40px repeat(24, minmax(16px, 1fr))" }}>
        <div />
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="text-center text-[9px] text-ink/35">
            {h % 3 === 0 ? formatHour(h) : ""}
          </div>
        ))}
        {DAY_LABELS.map((label, day) => (
          <div key={label} className="contents">
            <div className="flex items-center text-xs text-ink/50">{label}</div>
            {Array.from({ length: 24 }, (_, hour) => {
              const count = byKey.get(`${day}-${hour}`) ?? 0;
              return (
                <div key={hour} className="group relative">
                  <div
                    className="aspect-square rounded-sm transition-transform group-hover:scale-110"
                    style={{ background: colorFor(count, max) }}
                  />
                  {count > 0 && (
                    <div className="pointer-events-none absolute bottom-[calc(100%+4px)] left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-[10px] font-medium text-white group-hover:block">
                      {label} {formatHour(hour)}: {count} view{count === 1 ? "" : "s"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-ink/40">
        <span>Less</span>
        {RAMP.map((c) => (
          <span key={c} className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
