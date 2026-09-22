"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Brain, ChevronLeft, ChevronRight, Compass, Footprints, NotebookPen, Smile } from "lucide-react";
import { getMoodCalendarMonth, hasAnyMoodEntries, getDayDetail, type MoodCalendarMonth, type DayDetail } from "@/lib/local-journal";
import { getCbtHistory, type CbtHistoryEntry, type CbtExerciseType } from "@/lib/cbt-history";
import { CORE_EMOTIONS, moodColor, moodCore, moodLabel } from "@/lib/moods";
import { Container } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

export default function PatternsClient({
  userId,
  dict,
  typesDict,
  locale,
}: {
  userId: string;
  dict: Dictionary["moodPatterns"];
  typesDict: Dictionary["cbtExercises"];
  locale: Locale;
}) {
  const TYPE_META: Record<CbtExerciseType, { label: string; icon: typeof Brain }> = {
    reframing: { label: typesDict.typeReframing, icon: Brain },
    grounding: { label: typesDict.typeGrounding, icon: Compass },
    "next-step": { label: typesDict.typeNextStep, icon: Footprints },
    gratitude: { label: typesDict.typeGratitude, icon: Smile },
    "thought-record": { label: typesDict.typeThoughtRecord, icon: NotebookPen },
  };
  const intlLocale = locale === "ar" ? "ar-EG" : "en-GB";
  const today = useMemo(() => new Date(), []);
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [data, setData] = useState<MoodCalendarMonth | undefined>(undefined);
  const [hasAnyData, setHasAnyData] = useState<boolean | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayDetail, setDayDetail] = useState<DayDetail | null>(null);
  const [dayTools, setDayTools] = useState<CbtHistoryEntry[]>([]);

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    getDayDetail(userId, selectedDate).then((detail) => {
      if (!cancelled) setDayDetail(detail);
    });
    // CBT/tool completions (reframing, grounding, gratitude, thought record,
    // etc.) live in a separate device-only store from journal entries — see
    // cbt-history.ts — filtered here to whichever day is selected so the
    // day-detail sheet shows everything logged that day, not just the
    // journal.
    getCbtHistory().then((entries) => {
      if (!cancelled) setDayTools(entries.filter((e) => e.createdAt.slice(0, 10) === selectedDate));
    });
    return () => {
      cancelled = true;
    };
  }, [userId, selectedDate]);

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
  // calendar always reads as one of the 6 core colors. Ties go to "happy" —
  // the one pleasant core in this palette — over whichever was logged
  // first, so a day split evenly between happy and something else reads as
  // the good day; a tie between two unpleasant cores still falls back to
  // whichever was logged first.
  function mainCoreColorOf(moods: string[]): string | null {
    if (moods.length === 0) return null;
    const keys = moods.map((m) => moodCore(m) ?? m);
    const counts = new Map<string, number>();
    for (const k of keys) counts.set(k, (counts.get(k) ?? 0) + 1);
    let bestKey = keys[0];
    let bestCount = 0;
    for (const k of keys) {
      const count = counts.get(k)!;
      const isTieBreakWin = count === bestCount && k === "happy" && bestKey !== "happy";
      if (count > bestCount || isTieBreakWin) {
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
                const hasData = cell.moods.length > 0;
                return (
                  <button
                    key={cell.date}
                    type="button"
                    disabled={!hasData}
                    onClick={() => {
                      setDayDetail(null);
                      setSelectedDate(cell.date);
                    }}
                    className="flex flex-col items-center gap-1 py-1 disabled:cursor-default"
                  >
                    <span className={`text-xs font-medium ${isToday ? "text-brand-700" : "text-ink/60"}`}>
                      {cell.day}
                    </span>
                    <span
                      title={hasData ? cell.moods.map((m) => moodLabel(m, locale)).join(", ") : undefined}
                      className={`h-5 w-5 rounded-full border ${isToday ? "ring-2 ring-brand-400" : ""} ${
                        mainColor ? "border-brand-900/10" : "border-transparent bg-brand-50/60"
                      }`}
                      style={mainColor ? { backgroundColor: mainColor } : undefined}
                    />
                  </button>
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
                  className="h-2.5 w-2.5 rounded-full border border-brand-900/10"
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
                          className="h-2.5 w-2.5 rounded-full border border-brand-900/10"
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

      {selectedDate && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center">
          <div className="max-h-[85vh] w-full max-w-sm animate-pop-in overflow-y-auto rounded-3xl border-2 border-brand-100 bg-white shadow-2xl">
            <div className="px-6 py-5">
              <h2 className="font-display text-lg font-semibold text-brand-900">
                {new Intl.DateTimeFormat(intlLocale, { weekday: "long", day: "numeric", month: "long" }).format(
                  new Date(`${selectedDate}T00:00:00`),
                )}
              </h2>

              {!dayDetail ? (
                <div className="mt-4 h-20 animate-pulse rounded-xl bg-brand-50" />
              ) : (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/40">
                    {dict.dayDetailMoodsLabel}
                  </p>
                  {dayDetail.moods.length === 0 ? (
                    <p className="mt-1.5 text-sm text-ink/50">{dict.dayDetailNoMoods}</p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {dayDetail.moods.map((m, i) => (
                        <span
                          key={`${m}-${i}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50/60 px-2.5 py-1 text-xs font-medium text-ink/70"
                        >
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: moodColor(m) }} />
                          {moodLabel(m, locale)}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink/40">
                    {dict.dayDetailEntriesLabel}
                  </p>
                  {dayDetail.entries.length === 0 ? (
                    <p className="mt-1.5 text-sm text-ink/50">{dict.dayDetailNoEntries}</p>
                  ) : (
                    <div className="mt-2 space-y-3">
                      {dayDetail.entries.map((entry) => (
                        <div key={entry.id} className="rounded-xl border border-brand-100 bg-brand-50/40 p-3.5">
                          <p className="whitespace-pre-line text-sm text-ink/80">{entry.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {dayTools.length > 0 && (
                    <>
                      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink/40">
                        {dict.dayDetailToolsLabel}
                      </p>
                      <div className="mt-2 space-y-2">
                        {dayTools.map((tool) => {
                          const meta = TYPE_META[tool.type];
                          return (
                            <div
                              key={tool.id}
                              className="flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50/40 p-3"
                            >
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-brand-700">
                                <meta.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-ink/60">{meta.label}</p>
                                {tool.summary && <p className="mt-0.5 truncate text-sm text-ink/80">&ldquo;{tool.summary}&rdquo;</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="mt-6 w-full rounded-full border border-brand-200 px-4 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-brand-50 active:bg-brand-50"
              >
                {dict.dayDetailClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
