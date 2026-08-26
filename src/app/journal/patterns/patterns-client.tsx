"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMoodPatterns, type MoodPatterns } from "@/lib/local-journal";
import { moodColor, moodLabel } from "@/lib/moods";
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
  const [data, setData] = useState<MoodPatterns | null | undefined>(undefined);
  const DAY_LABELS = [dict.daySun, dict.dayMon, dict.dayTue, dict.dayWed, dict.dayThu, dict.dayFri, dict.daySat];

  useEffect(() => {
    getMoodPatterns(userId, locale).then(setData);
  }, [userId, locale]);

  if (data === undefined) return null;

  const { frequency, topMood, totalWithMood, heatmap } = data ?? {
    frequency: [],
    topMood: null,
    totalWithMood: 0,
    heatmap: [],
  };
  const weeks = Math.ceil(heatmap.length / 7);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Container className="py-16 sm:py-20">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-3xl font-medium text-brand-900">{dict.title}</h1>
        <Link href="/journal" className="text-sm font-medium text-brand-600 link-grow">
          {dict.viewEntries}
        </Link>
      </div>
      <p className="mt-2 text-sm text-ink/60">{dict.subtitle}</p>

      {totalWithMood === 0 ? (
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
            <h2 className="font-display font-semibold text-brand-900">{dict.last12Weeks}</h2>
            {topMood && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/60">
                {dict.mostCommonMood}
                <span
                  className="h-2.5 w-2.5 rounded-full border border-black/10"
                  style={{ backgroundColor: topMood.color }}
                />
                <span className="font-medium text-ink/80">{topMood.label}</span> ({topMood.count}×)
              </p>
            )}

            <div className="mt-5 overflow-x-auto">
              <div className="flex gap-3">
                <div className="flex flex-col justify-between py-0.5 text-[10px] text-ink/40">
                  {DAY_LABELS.map((d, i) => (
                    <span key={d} className={i % 2 === 0 ? "" : "opacity-0"}>
                      {d}
                    </span>
                  ))}
                </div>
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`, gridAutoFlow: "column", gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
                >
                  {heatmap.map((day) => (
                    <div
                      key={day.date}
                      title={`${day.date}${day.moods.length ? ` — ${day.moods.map((m) => moodLabel(m, locale)).join(", ")}` : ""}`}
                      className={`flex h-6 w-6 overflow-hidden rounded-md border ${
                        day.date === today ? "ring-2 ring-brand-400" : ""
                      } ${day.moods.length ? "border-black/10" : "border-transparent bg-brand-50/60"}`}
                    >
                      {day.moods.map((mood, i) => (
                        <span
                          key={i}
                          className="h-full flex-1"
                          style={{ backgroundColor: moodColor(mood) }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="font-display font-semibold text-brand-900">{dict.moodBreakdown}</h2>
            <div className="mt-4 space-y-3">
              {frequency.map((m) => (
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
          </div>
        </div>
      )}
    </Container>
  );
}
