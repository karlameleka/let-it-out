"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { getCbtHistory, deleteCbtEntry, type CbtHistoryEntry, type CbtExerciseType } from "@/lib/cbt-history";
import { buildThoughtRecordHistoryPdf } from "@/lib/thought-record-pdf";
import { reserveDownloadWindow, deliverBlob } from "@/lib/download-blob";
import type { Dictionary } from "@/lib/i18n/dictionary";

const THOUGHT_RECORD_COLUMN_KEYS = [
  "situation",
  "automaticThought",
  "feelingBefore",
  "distortions",
  "evidenceFor",
  "evidenceAgainst",
  "balanced",
  "feelingAfter",
] as const;

function formatDate(iso: string, locale: "en" | "ar"): string {
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** A "History" sheet showing every past device-local entry of one CBT
 * exercise type — reused by the Cognitive Reframing and Thought Record
 * full pages (see /profile/reframing and /profile/thought-record). Thought
 * Record entries render as a traditional thought-record table (one row
 * per entry, a fixed column per field); every other type renders as a
 * simpler card list, since only Thought Record has a fixed, tabular field
 * shape by design. */
export default function CbtTypeHistory({
  type,
  typeLabel,
  dict,
  locale,
  onClose,
}: {
  type: CbtExerciseType;
  typeLabel: string;
  dict: Dictionary["cbtHistoryModal"];
  locale: "en" | "ar";
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<CbtHistoryEntry[] | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCbtHistory().then((all) => {
      if (!cancelled) setEntries(all.filter((e) => e.type === type));
    });
    return () => {
      cancelled = true;
    };
  }, [type]);

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    setDeleting(true);
    await deleteCbtEntry(pendingDeleteId);
    setEntries((prev) => prev?.filter((e) => e.id !== pendingDeleteId) ?? prev);
    setDeleting(false);
    setPendingDeleteId(null);
  }

  async function downloadPdf() {
    if (!entries || entries.length === 0 || downloadingPdf) return;
    setDownloadingPdf(true);
    const reservedWindow = reserveDownloadWindow();
    try {
      const columns = THOUGHT_RECORD_COLUMN_KEYS.map((key) => ({ key, label: thoughtRecordColumnLabel(key, dict) }));
      const blob = await buildThoughtRecordHistoryPdf({ entries, columns, title: typeLabel, locale });
      deliverBlob(blob, `thought-record-history-${new Date().toISOString().slice(0, 10)}.pdf`, reservedWindow);
    } catch (err) {
      reservedWindow?.close();
      throw err;
    } finally {
      setDownloadingPdf(false);
    }
  }

  return (
    <>
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="max-h-[85vh] w-full max-w-3xl animate-pop-in overflow-y-auto rounded-3xl border-2 border-brand-100 bg-white shadow-2xl">
        <div className="px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{typeLabel}</p>
              <h2 className="mt-1 font-display text-lg font-semibold text-brand-900">{dict.title}</h2>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {type === "thought-record" && entries && entries.length > 0 && (
                <button
                  type="button"
                  onClick={downloadPdf}
                  disabled={downloadingPdf}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50 active:bg-brand-50 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={2} />
                  {dict.downloadPdf}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label={dict.close}
                className="shrink-0 rounded-full p-1.5 text-ink/40 transition-colors hover:text-ink/70 active:text-ink/70"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-ink/40">{dict.privacyNotice}</p>

          {entries === null ? (
            <div className="mt-6 h-20 animate-pulse rounded-xl bg-brand-50" />
          ) : entries.length === 0 ? (
            <p className="mt-6 text-sm text-ink/50">{dict.empty}</p>
          ) : type === "thought-record" ? (
            <ThoughtRecordTable entries={entries} dict={dict} locale={locale} onDelete={setPendingDeleteId} />
          ) : (
            <GenericHistoryList entries={entries} dict={dict} locale={locale} onDelete={setPendingDeleteId} />
          )}
        </div>
      </div>
    </div>

    {pendingDeleteId && (
      <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center">
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

function thoughtRecordColumnLabel(key: (typeof THOUGHT_RECORD_COLUMN_KEYS)[number], dict: Dictionary["cbtHistoryModal"]): string {
  const map: Record<(typeof THOUGHT_RECORD_COLUMN_KEYS)[number], string> = {
    situation: dict.colSituation,
    automaticThought: dict.colThought,
    feelingBefore: dict.colFeelingBefore,
    distortions: dict.colDistortions,
    evidenceFor: dict.colEvidenceFor,
    evidenceAgainst: dict.colEvidenceAgainst,
    balanced: dict.colBalanced,
    feelingAfter: dict.colFeelingAfter,
  };
  return map[key];
}

function ThoughtRecordTable({
  entries,
  dict,
  locale,
  onDelete,
}: {
  entries: CbtHistoryEntry[];
  dict: Dictionary["cbtHistoryModal"];
  locale: "en" | "ar";
  onDelete: (id: string) => void;
}) {
  const columns: { key: string; label: string }[] = [
    { key: "date", label: dict.colDate },
    { key: "situation", label: dict.colSituation },
    { key: "automaticThought", label: dict.colThought },
    { key: "feelingBefore", label: dict.colFeelingBefore },
    { key: "distortions", label: dict.colDistortions },
    { key: "evidenceFor", label: dict.colEvidenceFor },
    { key: "evidenceAgainst", label: dict.colEvidenceAgainst },
    { key: "balanced", label: dict.colBalanced },
    { key: "feelingAfter", label: dict.colFeelingAfter },
  ];

  return (
    <div className="mt-4 -mx-6 overflow-x-auto sm:-mx-8">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-brand-100 text-left">
            {columns.map((c) => (
              <th
                key={c.key}
                className="whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink/40 first:pl-6 sm:first:pl-8"
              >
                {c.label}
              </th>
            ))}
            <th className="px-3 py-2 last:pr-6 sm:last:pr-8" />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-brand-50 align-top">
              <td className="whitespace-nowrap px-3 py-3 pl-6 text-ink/60 sm:pl-8">{formatDate(entry.createdAt, locale)}</td>
              {columns.slice(1).map((c) => (
                <td key={c.key} className="max-w-[220px] px-3 py-3 text-ink/80">
                  {entry.data[c.key] || "—"}
                </td>
              ))}
              <td className="px-3 py-3 pr-6 sm:pr-8">
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  aria-label={dict.deleteEntry}
                  className="rounded-full p-1 text-ink/25 transition-colors hover:text-red-500 active:text-red-500"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function humanizeKey(key: string): string {
  const spaced = key.replace(/[-_]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function GenericHistoryList({
  entries,
  dict,
  locale,
  onDelete,
}: {
  entries: CbtHistoryEntry[];
  dict: Dictionary["cbtHistoryModal"];
  locale: "en" | "ar";
  onDelete: (id: string) => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      {entries.map((entry) => {
        const rows = Object.entries(entry.data).filter(([, v]) => v?.trim());
        return (
          <div key={entry.id} className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold text-ink/40">{formatDate(entry.createdAt, locale)}</p>
              <button
                type="button"
                onClick={() => onDelete(entry.id)}
                aria-label={dict.deleteEntry}
                className="shrink-0 rounded-full p-1 text-ink/25 transition-colors hover:text-red-500 active:text-red-500"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {rows.map(([key, value]) => (
                <div key={key}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">{humanizeKey(key)}</p>
                  <p className="mt-0.5 text-sm text-ink/80">{value}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
