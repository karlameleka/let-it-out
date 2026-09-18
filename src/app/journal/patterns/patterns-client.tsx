"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMoodCalendarMonth, hasAnyMoodEntries, type MoodCalendarMonth } from "@/lib/local-journal";
import { CORE_EMOTIONS, moodColor, moodCore, moodLabel } from "@/lib/moods";
import { Container } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

export default function PatternsClient({
  userId,
  dict,
  locale,
}: {
  userId: string;
  dict: Dictionary["moodPatterns"];
  locale: Locale;
}) {
  const intlLocale = locale === "ar" ? "ar-EG" : "en-GB";
  const today = useMemo(() => new Date(), []);
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [data, setData] = useState<MoodCalendarMonth | undefined>(undefined);
  const [hasAnyData, setHasAnyData] = useState<boolean | undefined>(undefined);

  const DAY_LABELS = [dict.daySun, dict.dayMon, dict.dayTue, dict.dayWed, dict.dayThu, dict.dayFri, dict.daySat];

  useEffect(() => {
    getMoodCalendarMonth(userId, viewYear, viewMonth, locale).then(setData);
  }, [userId, viewYear, viewMonth, locale]);

  useEffect(() => {
    hasAnyMoodEntries(userId).then(setHasAnyData);
  }, [userId]);

  if (data === undefined || hasAnyData === undefined) return null;

  const monthLabel = new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric" }).format(
    new Date(viewYear, viewMonth, 1),
  );
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }
  function goNextMonth() {
    if (isCurrentMonth) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const cells: (MoodCalendarMonth["days"][number] | null)[] = [
    ...Array.from({ length: data.leadingBlanks }, () => null),
    ...data.days,
  ];

  // A day can carry several logged mood ids at once — e.g. one wheel
  // check-in already logs both a core and a secondary id together, and a
  // journal entry can have multiple moods picked. Rather than splitting the
  // day's dot into a stripe per mood, resolve every mood to its core
  // (universal) emotion and show only the most-logged core's color — so the
  // calendar always reads as one of the 6 core colors, ties going to
  // whichever core was logged first.
  function mainCoreColorOf(moods: string[]): string | null {
    if (moods.length === 0) return null;
    const keys = moods.map((m) => moodCore(m) ?? m);
    const counts = new Map<string, number>();
    for (const k of keys) counts.set(k, (counts.get(k) ?? 0) + 1);
    let bestKey = keys[0];
    let bestCount = 0;
    for (const k of keys) {
      const count = counts.get(k)!;
      if (count > bestCount) {
        bestKey = k;
        bestCount = count;
      }
    }
    const core = CORE_EMOTIONS.find((c) => c.id === bestKey);
    return core ? core.color : moodColor(bestKey);
  }

  return (
    <Container className="py-16 sm:py-20">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-3xl font-medium text-brand-900">{dict.title}</h1>
        <Link href="/journal" className="text-sm font-medium text-brand-600 link-grow">
          {dict.viewEntries}
        </Link>
      </div>
      <p className="mt-2 text-sm text-ink/60">{dict.subtitle}</p>

      {!hasAnyData ? (
        <p className="mt-10 text-sm text-ink/60">
          {dict.noDataText}{" "}
          <Link href="/journal/new" className="font-medium text-brand-600 hover:underline active:underline">
            {dict.writeAnEntry}
          </Link>
          .
        </p>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goPrevMonth}
                aria-label={dict.previousMonth}
                className="rounded-lg p-1.5 text-ink/50 transition-colors hover:bg-brand-50 hover:text-ink/80"
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={2} />
              </button>
              <h2 className="font-display font-semibold text-brand-900">{monthLabel}</h2>
              <button
                type="button"
                onClick={goNextMonth}
                disabled={isCurrentMonth}
                aria-label={dict.nextMonth}
                className="rounded-lg p-1.5 text-ink/50 transition-colors hover:bg-brand-50 hover:text-ink/80 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium uppercase text-ink/40">
              {DAY_LABELS.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="mt-1.5 grid grid-cols-7 gap-1.5">
              {cells.map((cell, i) => {
                if (!cell) return <div key={`blank-${i}`} />;
                const isToday = cell.date === todayISO;
                const mainColor = mainCoreColorOf(cell.moods);
                return (
                  <div key={cell.date} className="flex flex-col items-center gap-1 py-1">
                    <span className={`text-xs font-medium ${isToday ? "text-brand-700" : "text-ink/60"}`}>
                      {cell.day}
                    </span>
                    <span
                      title={cell.moods.length ? cell.moods.map((m) => moodLabel(m, locale)).join(", ") : undefined}
                      className={`h-5 w-5 rounded-full border ${isToday ? "ring-2 ring-brand-400" : ""} ${
                        mainColor ? "border-black/10" : "border-transparent bg-brand-50/60"
                      }`}
                      style={mainColor ? { backgroundColor: mainColor } : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="font-display font-semibold text-brand-900">{dict.moodBreakdown}</h2>
            <p className="mt-1 text-sm text-ink/60">
              {dict.totalMoodsThisMonth}: <span className="font-medium text-ink/80">{data.totalEntries}</span>
            </p>
            {data.frequency[0] && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/60">
                {dict.mostCommonMood}
                <span
                  className="h-2.5 w-2.5 rounded-full border border-black/10"
                  style={{ backgroundColor: data.frequency[0].color }}
                />
                <span className="font-medium text-ink/80">{data.frequency[0].label}</span> ({data.frequency[0].count}×)
              </p>
            )}

            {data.frequency.length === 0 ? (
              <p className="mt-4 text-sm text-ink/50">{dict.noMoodsThisMonth}</p>
            ) : (
              <div className="mt-4 space-y-3">
                {data.frequency.map((m) => (
                  <div key={m.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-black/10"
                          style={{ backgroundColor: m.color }}
                        />
                        <span className="text-ink/80">{m.label}</span>
                      </span>
                      <span className="text-ink/50">{m.count}×</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-brand-50">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${m.percent}%`, backgroundColor: m.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Container>
  );
}
