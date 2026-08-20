"use client";

import { useEffect, useState } from "react";
import { getCbtStreak } from "@/lib/cbt-streak";

/** Small "N day streak" pill, read from localStorage after mount — renders
 * nothing until then (avoids a hydration mismatch) and nothing at all once
 * mounted if there's no streak yet, so a first-time visitor doesn't see a
 * "0 day streak" badge. */
export default function CbtStreakBadge({ className = "" }: { className?: string }) {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreak(getCbtStreak().streak);
  }, []);

  if (!streak) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      🔥 {streak} day{streak === 1 ? "" : "s"}
    </span>
  );
}
