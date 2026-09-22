"use client";

import { useState } from "react";
import { exportEntries } from "@/lib/local-journal";
import { exportReflectionEntries } from "@/lib/local-reflection";
import { exportAssessmentResults } from "@/lib/local-assessments";
import { buildJournalExportPdf } from "@/lib/journal-pdf";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

export default function ExportDataButton({ dict, userId, locale }: { dict: Dictionary; userId: string; locale: Locale }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = dict.account;

  async function handleExport() {
    setPending(true);
    setError(null);

    let blob: Blob;
    try {
      const [journal, reflections, assessments] = await Promise.all([
        exportEntries(userId),
        exportReflectionEntries(userId),
        exportAssessmentResults(userId),
      ]);
      blob = await buildJournalExportPdf({ journal, reflections, assessments, locale });
    } catch {
      setPending(false);
      setError(t.exportError);
      return;
    }
    setPending(false);

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `let-it-out-journal-export-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={handleExport}
        disabled={pending}
        className="rounded border-2 border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-700 transition-all duration-300 hover:bg-brand-50 active:bg-brand-50 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.08)] active:shadow-[0_0_0_6px_rgba(30,91,115,0.08)] disabled:opacity-60"
      >
        {pending ? t.preparingExport : t.downloadButton}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
