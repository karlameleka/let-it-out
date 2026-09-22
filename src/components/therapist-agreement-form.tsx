"use client";

import { useActionState, useRef, useState } from "react";
import { updateTherapistAgreement, removeTherapistAgreement } from "@/lib/therapist-agreement-actions";
import { Download, Trash2 } from "lucide-react";
import PdfOpenButton from "@/components/pdf-open-button";
import { Button } from "@/components/ui";

const MAX_AGREEMENT_MB = 8;

function readFileAsDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function TherapistAgreementForm({
  currentFileData,
  currentFileName,
}: {
  currentFileData: string | null;
  currentFileName: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateTherapistAgreement, undefined);
  const [key, setKey] = useState(0);
  const [lastHandledState, setLastHandledState] = useState(state);
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state?.success) {
      setKey((k) => k + 1);
      setFileData(null);
      setFileName("");
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setFileError("Please choose a PDF file.");
      return;
    }
    if (file.size > MAX_AGREEMENT_MB * 1024 * 1024) {
      setFileError(`That file is too large, please keep it under ${MAX_AGREEMENT_MB}MB.`);
      return;
    }
    setFileError(null);
    setFileData(await readFileAsDataUri(file));
    setFileName(file.name);
  }

  return (
    <div className="space-y-3">
      {currentFileData && currentFileName && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50/60 p-3">
          <div className="flex min-w-0 items-center gap-2">
            <PdfOpenButton
              fileData={currentFileData}
              fileName={currentFileName}
              className="inline-flex items-center gap-1.5 truncate text-sm font-semibold text-brand-700 link-grow"
            >
              <Download className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              <span className="truncate">{currentFileName}</span>
            </PdfOpenButton>
          </div>
          <form action={removeTherapistAgreement}>
            <button
              type="submit"
              aria-label="Remove agreement"
              title="Remove agreement"
              className="shrink-0 rounded-lg p-1.5 text-ink/40 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>
        </div>
      )}

      <form action={formAction} key={key} className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-brand-200 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          {fileName || (currentFileData ? "Replace with a new PDF…" : "Choose a PDF…")}
        </button>
        <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
        <input type="hidden" name="fileData" value={fileData ?? ""} />
        <input type="hidden" name="fileName" value={fileName} />
        <Button type="submit" disabled={pending || !fileData} variant="outline" className="!px-4 !py-2 text-xs">
          {pending ? "Uploading…" : "Upload"}
        </Button>
        {state?.success && <p className="w-full text-xs font-medium text-brand-700">Uploaded.</p>}
        {(fileError || state?.error) && <p className="w-full text-xs text-red-600">{fileError || state?.error}</p>}
      </form>
    </div>
  );
}
