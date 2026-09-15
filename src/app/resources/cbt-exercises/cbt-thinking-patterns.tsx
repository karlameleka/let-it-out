"use client";

import { useEffect, useState } from "react";
import { getDistortionFrequency, type DistortionFrequency } from "@/lib/cbt-history";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function CbtThinkingPatterns({ dict }: { dict: Dictionary["cbtExercises"] }) {
  const [patterns, setPatterns] = useState<DistortionFrequency[] | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPatterns(getDistortionFrequency());
  }, []);

  if (!patterns || patterns.length === 0) return null;

  const max = patterns[0].count;

  return (
    <div className="mt-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">{dict.thinkingTrapsLabel}</p>
      <p className="mt-1.5 text-sm text-ink/60">{dict.thinkingTrapsDescription}</p>
      <div className="mt-4 space-y-3 rounded-2xl border border-brand-100 bg-white p-5">
        {patterns.slice(0, 6).map((p) => (
          <div key={p.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink/80">{p.label}</span>
              <span className="text-ink/40">
                {p.count}× {dict.flagged}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand-50">
              <div
                className="h-full rounded-full bg-brand-600"
                style={{ width: `${Math.max((p.count / max) * 100, 8)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
