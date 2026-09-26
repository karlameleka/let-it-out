"use client";

import { useEffect, useState } from "react";
import { Brain, Smile, Compass, Footprints, NotebookPen, X } from "lucide-react";
import { getCbtHistory, deleteCbtEntry, type CbtHistoryEntry, type CbtExerciseType } from "@/lib/cbt-history";
import type { Dictionary } from "@/lib/i18n/dictionary";

function humanizeKey(key: string): string {
  const spaced = key.replace(/[-_]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function relativeDate(iso: string, dict: Dictionary["cbtExercises"]): string {
  const date = new Date(iso);
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return dict.today;
  if (days === 1) return dict.yesterday;
  if (days < 7) return dict.daysAgo.replace("{n}", String(days));
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function CbtHistoryList({ dict }: { dict: Dictionary["cbtExercises"] }) {
  const TYPE_META: Record<CbtExerciseType, { label: string; icon: typeof Brain }> = {
    reframing: { label: dict.typeReframing, icon: Brain },
    grounding: { label: dict.typeGrounding, icon: Compass },
    "next-step": { label: dict.typeNextStep, icon: Footprints },
    gratitude: { label: dict.typeGratitude, icon: Smile },
    "thought-record": { label: dict.typeThoughtRecord, icon: NotebookPen },
  };
  const [entries, setEntries] = useState<CbtHistoryEntry[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getCbtHistory().then(setEntries);
  }, []);

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    setDeleting(true);
    await deleteCbtEntry(pendingDeleteId);
    setEntries((prev) => prev?.filter((e) => e.id !== pendingDeleteId) ?? prev);
    setDeleting(false);
    setPendingDeleteId(null);
  }

  if (!entries || entries.length === 0) return null;

  return (
    <>
    <div className="mt-12">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">{dict.recentEntriesLabel}</p>
      <div className="mt-4 space-y-2">
        {entries.slice(0, 8).map((entry) => {
          const meta = TYPE_META[entry.type];
          const expanded = expandedId === entry.id;
          const dataRows = Object.entries(entry.data).filter(([, value]) => value?.trim());
          return (
            <div key={entry.id} className="rounded-xl border border-brand-100 bg-white">
              <div className="flex items-start gap-3 p-4">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : entry.id)}
                  disabled={dataRows.length === 0}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left disabled:cursor-default"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <meta.icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-ink/40">
                      {meta.label} · {relativeDate(entry.createdAt, dict)}
                    </p>
                    {entry.summary && <p className="mt-0.5 truncate text-sm text-ink/80">&ldquo;{entry.summary}&rdquo;</p>}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDeleteId(entry.id)}
                  aria-label={dict.deleteEntry}
                  className="shrink-0 rounded-full p-1 text-ink/25 hover:text-ink/50 active:text-ink/50"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              {expanded && dataRows.length > 0 && (
                <div className="animate-pop-in space-y-2.5 border-t border-brand-50 px-4 pb-4 pt-3">
                  {dataRows.map(([key, value]) => (
                    <div key={key}>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">{humanizeKey(key)}</p>
                      <p className="mt-0.5 text-sm text-ink/80">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>

    {pendingDeleteId && (
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center">
        <div className="w-full max-w-sm animate-pop-in overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-2xl">
          <div className="px-6 py-5">
            <h2 className="font-display text-lg font-semibold text-brand-900">{dict.deleteEntry}</h2>
            <p className="mt-2 text-sm text-ink/70">{dict.deleteConfirm}</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                disabled={deleting}
                className="flex-1 rounded-full border border-brand-200 px-4 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-brand-50 active:bg-brand-50 disabled:opacity-50"
              >
                {dict.cancel}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 active:bg-red-700 disabled:opacity-50"
              >
                {deleting ? dict.deleting : dict.delete}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
