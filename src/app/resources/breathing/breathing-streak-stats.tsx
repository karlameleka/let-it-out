"use client";

import { useEffect, useState } from "react";
import { getBreathingStreak, type BreathingStreakStats as Stats } from "@/lib/breathing-streak";

export default function BreathingStreakStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStats(getBreathingStreak());
  }, []);

  if (!stats || stats.total === 0) return null;

  return (
    <div className="inline-flex divide-x divide-brand-100 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm">
      <div className="px-6 py-3.5">
        <p className="font-display text-2xl font-semibold leading-none text-brand-900">{stats.streak}</p>
        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">day streak</p>
      </div>
      <div className="px-6 py-3.5">
        <p className="font-display text-2xl font-semibold leading-none text-brand-900">{stats.total}</p>
        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
          {stats.total === 1 ? "day practiced" : "days practiced"}
        </p>
      </div>
      <div className="px-6 py-3.5">
        <p className="font-display text-2xl font-semibold leading-none text-brand-900">{stats.totalMinutes}</p>
        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">
          {stats.totalMinutes === 1 ? "minute breathing" : "minutes breathing"}
        </p>
      </div>
    </div>
  );
}
