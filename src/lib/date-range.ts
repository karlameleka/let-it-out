// Shared date-range resolution for every dashboard page that reads a
// ?from=&to= pair from the URL (see components/date-range-picker.tsx) —
// keeps "what does an empty/partial range default to" and "what counts as
// the prior comparable period for a trend indicator" identical everywhere
// instead of each page inventing its own rules. Dates are plain UTC
// "YYYY-MM-DD" strings/boundaries throughout, the same convention already
// used for booking dates elsewhere in this app (see todayISO/tomorrowISO
// in therapist-data.ts) — no per-timezone shifting.

export type DateRange = { from: Date; to: Date };

export type PresetKey = "today" | "7d" | "30d" | "this_month" | "last_month" | "ytd";

export const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "this_month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "ytd", label: "Year to date" },
];

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

function endOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
}

export function rangeForPreset(preset: PresetKey, now: Date = new Date()): DateRange {
  const today = startOfDayUTC(now);
  switch (preset) {
    case "today":
      return { from: today, to: endOfDayUTC(now) };
    case "7d": {
      const from = new Date(today);
      from.setUTCDate(from.getUTCDate() - 6);
      return { from, to: endOfDayUTC(now) };
    }
    case "this_month": {
      const from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
      return { from, to: endOfDayUTC(now) };
    }
    case "last_month": {
      const from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
      const to = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0, 23, 59, 59, 999));
      return { from, to };
    }
    case "ytd": {
      const from = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
      return { from, to: endOfDayUTC(now) };
    }
    case "30d":
    default: {
      const from = new Date(today);
      from.setUTCDate(from.getUTCDate() - 29);
      return { from, to: endOfDayUTC(now) };
    }
  }
}

function parseDateParam(raw: string | undefined): Date | null {
  if (!raw) return null;
  const d = new Date(`${raw}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Resolves the ?from=&to= search params every dashboard page reads,
 * falling back to the last-30-days preset when either is missing or
 * invalid — the same default every page shows on first visit, before the
 * admin has picked anything. */
export function resolveDateRange(searchParams: { from?: string; to?: string }): DateRange {
  const from = parseDateParam(searchParams.from);
  const to = parseDateParam(searchParams.to);
  if (!from || !to || from > to) return rangeForPreset("30d");
  return { from: startOfDayUTC(from), to: endOfDayUTC(to) };
}

/** The immediately-preceding period of the same length — what a trend
 * indicator ("+12% vs last period") compares against, for any range the
 * admin has selected, not just a fixed calendar month. */
export function priorPeriod(range: DateRange): DateRange {
  const spanMs = range.to.getTime() - range.from.getTime();
  const to = new Date(range.from.getTime() - 1);
  const from = new Date(to.getTime() - spanMs);
  return { from, to };
}

export function toDateParam(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Percent change from `prev` to `current`, rounded to the nearest whole
 * percent. Null when there's no baseline to compare against (prev is 0) —
 * "+infin%" is never a meaningful thing to show, callers render a
 * "new" / "—" state instead. */
export function percentChange(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((current - prev) / prev) * 100);
}
