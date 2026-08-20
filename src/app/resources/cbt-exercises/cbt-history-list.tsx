"use client";

import { useEffect, useState } from "react";
import { Brain, Compass, Footprints, X } from "lucide-react";
import { getCbtHistory, deleteCbtEntry, type CbtHistoryEntry, type CbtExerciseType } from "@/lib/cbt-history";

const TYPE_META: Record<CbtExerciseType, { label: string; icon: typeof Brain }> = {
  reframing: { label: "Cognitive Reframing", icon: Brain },
  grounding: { label: "5-4-3-2-1 Grounding", icon: Compass },
  "next-step": { label: "Tiny Next Step", icon: Footprints },
};

function relativeDate(iso: string): string {
  const date = new Date(iso);
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function CbtHistoryList() {
  const [entries, setEntries] = useState<CbtHistoryEntry[] | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(getCbtHistory());
  }, []);

  function remove(id: string) {
    deleteCbtEntry(id);
    setEntries((prev) => prev?.filter((e) => e.id !== id) ?? prev);
  }

  if (!entries || entries.length === 0) return null;

  return (
    <div className="mt-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">
        Your recent entries — saved only on this device
      </p>
      <div className="mt-4 space-y-2">
        {entries.slice(0, 8).map((entry) => {
          const meta = TYPE_META[entry.type];
          return (
            <div
              key={entry.id}
              className="flex items-start gap-3 rounded-xl border border-brand-100 bg-white p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <meta.icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink/40">
                  {meta.label} · {relativeDate(entry.createdAt)}
                </p>
                {entry.summary && <p className="mt-0.5 truncate text-sm text-ink/80">&ldquo;{entry.summary}&rdquo;</p>}
              </div>
              <button
                type="button"
                onClick={() => remove(entry.id)}
                aria-label="Delete this entry"
                className="shrink-0 rounded-full p-1 text-ink/25 hover:text-ink/50 active:text-ink/50"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
