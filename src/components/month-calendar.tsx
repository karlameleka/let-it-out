"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/locale";

const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Month-view calendar grid. Only dates present in `highlightedDates` are
 * clickable — everything else renders disabled/greyed out. Used to let
 * visitors pick a day with real availability instead of scanning a flat
 * list of date pills. */
export default function MonthCalendar({
  highlightedDates,
  selectedDate,
  onSelectDate,
  locale,
}: {
  highlightedDates: Set<string>;
  selectedDate?: string;
  onSelectDate: (date: string) => void;
  locale: Locale;
}) {
  const intlLocale = locale === "ar" ? "ar-EG" : "en-GB";
  const initialMonth = useMemo(() => {
    const first = selectedDate ?? [...highlightedDates].sort()[0];
    const base = first ? new Date(`${first}T00:00:00`) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toISODate(new Date(year, month, d)));

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(intlLocale, { weekday: "short" });
    // 2024-01-07 is a Sunday, matching Date.getDay()'s 0-index.
    return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(2024, 0, 7 + i)));
  }, [intlLocale]);
  const monthLabel = new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric" }).format(viewMonth);
  const todayISO = toISODate(new Date());

  return (
    <div className="rounded-xl border border-brand-200 bg-white p-3">
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setViewMonth(new Date(year, month - 1, 1))}
          aria-label="Previous month"
          className="rounded-lg p-1.5 text-ink/50 transition-colors hover:bg-brand-50 hover:text-ink/80"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={2} />
        </button>
        <p className="text-sm font-semibold text-brand-900">{monthLabel}</p>
        <button
          type="button"
          onClick={() => setViewMonth(new Date(year, month + 1, 1))}
          aria-label="Next month"
          className="rounded-lg p-1.5 text-ink/50 transition-colors hover:bg-brand-50 hover:text-ink/80"
        >
          <ChevronRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2} />
        </button>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase text-ink/40">
        {weekdayLabels.map((w, i) => (
          <div key={i}>{w}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const available = highlightedDates.has(date);
          const isSelected = date === selectedDate;
          const isToday = date === todayISO;
          return (
            <button
              key={date}
              type="button"
              disabled={!available}
              onClick={() => onSelectDate(date)}
              className={`aspect-square rounded-lg text-xs font-semibold transition-colors ${
                isSelected
                  ? "bg-brand-700 text-white"
                  : available
                    ? "bg-brand-50 text-brand-800 hover:bg-brand-100"
                    : "cursor-not-allowed text-ink/25"
              } ${isToday && !isSelected ? "ring-1 ring-inset ring-brand-300" : ""}`}
            >
              {Number(date.slice(-2))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
