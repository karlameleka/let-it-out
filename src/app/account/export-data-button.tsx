"use client";

import { useState } from "react";
import { exportJournalEntries } from "@/lib/journal-actions";

export default function ExportDataButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setPending(true);
    setError(null);

    const data = await exportJournalEntries();
    setPending(false);
    if (!data) {
      setError("Couldn't export your data — please try again.");
      return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `let-it-out-journal-export-${new Date().toISOString().slice(0, 10)}.json`;
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
        className="rounded-full border-2 border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-700 transition-all hover:bg-brand-50 disabled:opacity-60"
      >
        {pending ? "Preparing your export…" : "Download my journal entries (JSON)"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
