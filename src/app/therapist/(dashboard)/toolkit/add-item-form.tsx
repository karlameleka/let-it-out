"use client";

import { useActionState, useRef, useState } from "react";
import { addToolkitLink, addToolkitPdf } from "@/lib/therapist-actions";
import { MAX_TOOLKIT_PDF_BYTES } from "@/lib/therapist-toolkit";
import { Button } from "@/components/ui";

const fieldClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40";

function readFileAsDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function LinkForm() {
  const [state, formAction, pending] = useActionState(addToolkitLink, undefined);
  const [key, setKey] = useState(0);
  const [lastHandledState, setLastHandledState] = useState(state);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state?.success) setKey((k) => k + 1);
  }

  return (
    <form action={formAction} key={key} className="space-y-3">
      <div>
        <label htmlFor="link-title" className={labelClass}>Title</label>
        <input id="link-title" name="title" required className={fieldClass} placeholder="e.g. Thought record worksheet" />
      </div>
      <div>
        <label htmlFor="link-url" className={labelClass}>Link</label>
        <input id="link-url" name="url" type="url" required className={fieldClass} placeholder="https://…" />
      </div>
      <div>
        <label htmlFor="link-description" className={labelClass}>Description (optional)</label>
        <input id="link-description" name="description" className={fieldClass} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} variant="outline" className="!px-4 !py-2 text-xs">
        {pending ? "Adding…" : "Add link"}
      </Button>
    </form>
  );
}

function PdfForm() {
  const [state, formAction, pending] = useActionState(addToolkitPdf, undefined);
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
    if (file.size > MAX_TOOLKIT_PDF_BYTES) {
      setFileError(`That file is too large — please keep it under ${Math.floor(MAX_TOOLKIT_PDF_BYTES / (1024 * 1024))}MB.`);
      return;
    }
    setFileError(null);
    setFileData(await readFileAsDataUri(file));
    setFileName(file.name);
  }

  return (
    <form action={formAction} key={key} className="space-y-3">
      <div>
        <label htmlFor="pdf-title" className={labelClass}>Title</label>
        <input id="pdf-title" name="title" required className={fieldClass} placeholder="e.g. Grounding handout" />
      </div>
      <div>
        <label className={labelClass}>PDF file</label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-brand-200 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          {fileName || "Choose a PDF…"}
        </button>
        <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
        {fileError && <p className="mt-1.5 text-xs text-red-600">{fileError}</p>}
        <input type="hidden" name="fileData" value={fileData ?? ""} />
        <input type="hidden" name="fileName" value={fileName} />
      </div>
      <div>
        <label htmlFor="pdf-description" className={labelClass}>Description (optional)</label>
        <input id="pdf-description" name="description" className={fieldClass} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending || !fileData} variant="outline" className="!px-4 !py-2 text-xs">
        {pending ? "Adding…" : "Add PDF"}
      </Button>
    </form>
  );
}

export default function AddToolkitItemForm() {
  const [tab, setTab] = useState<"link" | "pdf">("link");

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5">
      <p className="font-display font-semibold text-brand-900">Add to your toolbox</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("link")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            tab === "link" ? "bg-brand-700 text-white" : "border border-brand-200 text-ink/60 hover:bg-brand-50"
          }`}
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => setTab("pdf")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            tab === "pdf" ? "bg-brand-700 text-white" : "border border-brand-200 text-ink/60 hover:bg-brand-50"
          }`}
        >
          PDF upload
        </button>
      </div>
      <div className="mt-4">{tab === "link" ? <LinkForm /> : <PdfForm />}</div>
    </div>
  );
}
