// Imports from timezone-constants.ts, not timezone.ts — this file is
// reached from date-range-picker.tsx, a client component, and timezone.ts
// pulls in next/headers (via getUserTimeZone()), which can't be bundled
// for the client. See timezone-constants.ts's own comment for the split.
import { CAIRO_TIME_ZONE, addDaysToDateStr, todayInTimeZone, zonedTimeToUtc } from "@/lib/timezone-constants";

// Shared date-range resolution for every dashboard page that reads a
// ?from=&to= pair from the URL (see components/date-range-picker.tsx) —
// keeps "what does an empty/partial range default to" and "what counts as
// the prior comparable period for a trend indicator" identical everywhere
// instead of each page inventing its own rules. Every boundary here is
// anchored to Cairo's calendar day (CAIRO_TIME_ZONE) — the admin
// dashboard's own fixed timezone, deliberately not tied to whichever
// device happens to be viewing it, same as the booking calendar and the
// therapist portal (see src/lib/timezone.ts).

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

function cairoDateStr(d: Date): string {
  return todayInTimeZone(CAIRO_TIME_ZONE, d);
}

function startOfDayCairo(d: Date): Date {
  return zonedTimeToUtc(cairoDateStr(d), "00:00", CAIRO_TIME_ZONE);
}

function endOfDayCairo(d: Date): Date {
  const nextDay = addDaysToDateStr(cairoDateStr(d), 1);
  return new Date(zonedTimeToUtc(nextDay, "00:00", CAIRO_TIME_ZONE).getTime() - 1);
}

export function rangeForPreset(preset: PresetKey, now: Date = new Date()): DateRange {
  const todayStr = cairoDateStr(now);
  const [year, month] = todayStr.split("-").map(Number);
  const today = startOfDayCairo(now);
  switch (preset) {
    case "today":
      return { from: today, to: endOfDayCairo(now) };
    case "7d": {
      const from = zonedTimeToUtc(addDaysToDateStr(todayStr, -6), "00:00", CAIRO_TIME_ZONE);
      return { from, to: endOfDayCairo(now) };
    }
    case "this_month": {
      const from = zonedTimeToUtc(`${year}-${String(month).padStart(2, "0")}-01`, "00:00", CAIRO_TIME_ZONE);
      return { from, to: endOfDayCairo(now) };
    }
    case "last_month": {
      // Day 0 of the current Cairo month is the last day of the previous
      // one — computed via plain UTC integer math on the Y-M-D triple (not
      // a timezone conversion, see addDaysToDateStr), then re-anchored to
      // Cairo below.
      const firstOfThisMonth = new Date(Date.UTC(year, month - 1, 1));
      const lastDayOfPrevMonth = new Date(Date.UTC(year, month - 1, 0));
      const from = zonedTimeToUtc(
        `${lastDayOfPrevMonth.getUTCFullYear()}-${String(lastDayOfPrevMonth.getUTCMonth() + 1).padStart(2, "0")}-01`,
        "00:00",
        CAIRO_TIME_ZONE,
      );
      const to = new Date(zonedTimeToUtc(`${firstOfThisMonth.getUTCFullYear()}-${String(firstOfThisMonth.getUTCMonth() + 1).padStart(2, "0")}-01`, "00:00", CAIRO_TIME_ZONE).getTime() - 1);
      return { from, to };
    }
    case "ytd": {
      const from = zonedTimeToUtc(`${year}-01-01`, "00:00", CAIRO_TIME_ZONE);
      return { from, to: endOfDayCairo(now) };
    }
    case "30d":
    default: {
      const from = zonedTimeToUtc(addDaysToDateStr(todayStr, -29), "00:00", CAIRO_TIME_ZONE);
      return { from, to: endOfDayCairo(now) };
    }
  }
}

function parseDateParam(raw: string | undefined): Date | null {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = zonedTimeToUtc(raw, "00:00", CAIRO_TIME_ZONE);
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
  return { from: startOfDayCairo(from), to: endOfDayCairo(to) };
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
  return cairoDateStr(d);
}

/** Percent change from `prev` to `current`, rounded to the nearest whole
 * percent. Null when there's no baseline to compare against (prev is 0) —
 * "+infin%" is never a meaningful thing to show, callers render a
 * "new" / "—" state instead. */
export function percentChange(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((current - prev) / prev) * 100);
}
