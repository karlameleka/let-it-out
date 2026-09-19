"use client";

import { Download } from "lucide-react";

const FORMATS = [
  { format: "csv", label: "CSV" },
  { format: "xlsx", label: "Excel" },
  { format: "pdf", label: "PDF" },
] as const;

/**
 * One-click export row — three links straight to the matching export route
 * handler (?format=csv|xlsx|pdf plus whatever filters are currently
 * applied), not a client-side fetch-and-download: a plain link lets the
 * browser handle the download/Content-Disposition natively, works with
 * "open in new tab", and needs no loading state of its own.
 */
export default function ExportButtons({
  endpoint,
  params,
}: {
  /** The export route handler, e.g. "/admin/audit-log/export". */
  endpoint: string;
  /** Current filters (date range, search, etc.) to carry into the export
   * — the export should reflect exactly what's on screen. */
  params?: Record<string, string>;
}) {
  function hrefFor(format: string) {
    const search = new URLSearchParams(params);
    search.set("format", format);
    return `${endpoint}?${search.toString()}`;
  }

  return (
    <div className="flex items-center gap-1.5">
      <Download className="h-3.5 w-3.5 text-ink/35" strokeWidth={2} />
      {FORMATS.map((f, i) => (
        <span key={f.format} className="flex items-center gap-1.5">
          <a
            href={hrefFor(f.format)}
            className="text-xs font-medium text-brand-600 underline-offset-2 hover:underline"
          >
            {f.label}
          </a>
          {i < FORMATS.length - 1 && <span className="text-xs text-ink/25">·</span>}
        </span>
      ))}
    </div>
  );
}
