"use client";

import { Download, Check } from "lucide-react";
import { toggleAssignmentComplete } from "@/lib/client-resources-actions";
import type { MyAssignedResource } from "@/lib/client-resources";
import PdfOpenButton from "@/components/pdf-open-button";

export default function MyToolsItem({ item }: { item: MyAssignedResource }) {
  const isDone = Boolean(item.completedAt);

  return (
    <div className={`rounded-2xl border p-5 ${isDone ? "border-brand-100 bg-brand-50/40" : "border-brand-100 bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={`font-display font-semibold ${isDone ? "text-brand-700 line-through" : "text-brand-900"}`}>{item.title}</p>
          <p className="mt-0.5 text-xs text-ink/40">From {item.counselor.name}</p>
        </div>
        {item.kind === "ASSIGNMENT" && (
          <form action={toggleAssignmentComplete}>
            <input type="hidden" name="itemId" value={item.id} />
            <button
              type="submit"
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                isDone ? "bg-brand-700 text-white" : "border border-brand-200 text-brand-700 hover:bg-brand-50"
              }`}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              {isDone ? "Done" : "Mark as done"}
            </button>
          </form>
        )}
      </div>

      {item.description && <p className="mt-2 text-sm text-ink/60">{item.description}</p>}
      {(item.kind === "TEXT" || item.kind === "ASSIGNMENT") && item.content && (
        <p className="mt-2 whitespace-pre-line text-sm text-ink/70">{item.content}</p>
      )}
      {item.kind === "LINK" && (
        <a
          href={item.url ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-semibold text-brand-600 link-grow"
        >
          Open →
        </a>
      )}
      {item.kind === "PDF" && item.fileData && (
        <PdfOpenButton
          fileData={item.fileData}
          fileName={item.fileName ?? "document.pdf"}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 link-grow"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
          Open / Download PDF
        </PdfOpenButton>
      )}
    </div>
  );
}
