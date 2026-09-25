"use client";

import { useState } from "react";
import { exportEntries } from "@/lib/local-journal";
import { exportReflectionEntries } from "@/lib/local-reflection";
import { exportAssessmentResults } from "@/lib/local-assessments";
import { buildJournalExportPdf } from "@/lib/journal-pdf";
import { deliverBlob } from "@/lib/download-blob";
import { withTimeout } from "@/lib/with-timeout";
import { todayLocalDayKey } from "@/lib/local-day";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

const PDF_BUILD_TIMEOUT_MS = 25_000;

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
      blob = await withTimeout(
        buildJournalExportPdf({ journal, reflections, assessments, locale }),
        PDF_BUILD_TIMEOUT_MS,
        "PDF build timed out",
      );
    } catch {
      setPending(false);
      setError(t.exportError);
      return;
    }
    setPending(false);

    deliverBlob(blob, `let-it-out-journal-export-${todayLocalDayKey()}.pdf`);
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
