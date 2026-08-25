"use client";

import { useActionState, useRef, useState } from "react";
import { assignResourceLink, assignResourcePdf, assignResourceNote } from "@/lib/therapist-actions";
import { CLIENT_TOOLS, MAX_TOOLKIT_PDF_BYTES } from "@/lib/therapist-toolkit";
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

function LinkTab({ clientEmail }: { clientEmail: string }) {
  const [state, formAction, pending] = useActionState(assignResourceLink, undefined);
  const [key, setKey] = useState(0);
  const [lastHandledState, setLastHandledState] = useState(state);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state?.success) {
      setKey((k) => k + 1);
      setTitle("");
      setUrl("");
    }
  }

  return (
    <form action={formAction} key={key} className="space-y-3">
      <input type="hidden" name="clientEmail" value={clientEmail} />
      <div>
        <label htmlFor="assign-tool-pick" className={labelClass}>Quick-pick one of our tools (optional)</label>
        <select
          id="assign-tool-pick"
          className={fieldClass}
          defaultValue=""
          onChange={(e) => {
            const tool = CLIENT_TOOLS.find((t) => t.key === e.target.value);
            if (tool) {
              setTitle(tool.title);
              setUrl(`${window.location.origin}${tool.href}`);
            }
          }}
        >
          <option value="">Choose a built-in tool…</option>
          {CLIENT_TOOLS.map((t) => (
            <option key={t.key} value={t.key}>{t.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="assign-link-title" className={labelClass}>Title</label>
        <input
          id="assign-link-title"
          name="title"
          required
          className={fieldClass}
          placeholder="e.g. Guided Breathing"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="assign-link-url" className={labelClass}>Link</label>
        <input
          id="assign-link-url"
          name="url"
          type="url"
          required
          className={fieldClass}
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="assign-link-description" className={labelClass}>Note (optional)</label>
        <input id="assign-link-description" name="description" className={fieldClass} placeholder="Why you're sending this" />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} variant="outline" className="!px-4 !py-2 text-xs">
        {pending ? "Sending…" : "Send to client"}
      </Button>
    </form>
  );
}

function PdfTab({ clientEmail }: { clientEmail: string }) {
  const [state, formAction, pending] = useActionState(assignResourcePdf, undefined);
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
      <input type="hidden" name="clientEmail" value={clientEmail} />
      <div>
        <label htmlFor="assign-pdf-title" className={labelClass}>Title</label>
        <input id="assign-pdf-title" name="title" required className={fieldClass} placeholder="e.g. Grounding handout" />
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
        <label htmlFor="assign-pdf-description" className={labelClass}>Note (optional)</label>
        <input id="assign-pdf-description" name="description" className={fieldClass} placeholder="Why you're sending this" />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending || !fileData} variant="outline" className="!px-4 !py-2 text-xs">
        {pending ? "Sending…" : "Send to client"}
      </Button>
    </form>
  );
}

function NoteTab({ clientEmail }: { clientEmail: string }) {
  const [state, formAction, pending] = useActionState(assignResourceNote, undefined);
  const [key, setKey] = useState(0);
  const [lastHandledState, setLastHandledState] = useState(state);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state?.success) setKey((k) => k + 1);
  }

  return (
    <form action={formAction} key={key} className="space-y-3">
      <input type="hidden" name="clientEmail" value={clientEmail} />
      <div>
        <label htmlFor="assign-note-title" className={labelClass}>Title</label>
        <input id="assign-note-title" name="title" required className={fieldClass} placeholder="e.g. Try this before our next session" />
      </div>
      <div>
        <label htmlFor="assign-note-content" className={labelClass}>What you want them to read or do</label>
        <textarea id="assign-note-content" name="content" required rows={4} className={fieldClass} />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink/80">
        <input type="checkbox" name="isAssignment" defaultChecked />
        This is an assignment — let them mark it done
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} variant="outline" className="!px-4 !py-2 text-xs">
        {pending ? "Sending…" : "Send to client"}
      </Button>
    </form>
  );
}

export default function AssignResourceForm({ clientEmail }: { clientEmail: string }) {
  const [tab, setTab] = useState<"link" | "pdf" | "note">("link");

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5">
      <p className="font-display font-semibold text-brand-900">Send a resource to this client</p>
      <p className="mt-1 text-sm text-ink/60">Appears only to them, under &ldquo;My tools&rdquo; on their Resources page.</p>
      <div className="mt-3 flex gap-2">
        {(["link", "pdf", "note"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              tab === t ? "bg-brand-700 text-white" : "border border-brand-200 text-ink/60 hover:bg-brand-50"
            }`}
          >
            {t === "link" ? "Tool / Link" : t === "pdf" ? "PDF" : "Text / Assignment"}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tab === "link" && <LinkTab clientEmail={clientEmail} />}
        {tab === "pdf" && <PdfTab clientEmail={clientEmail} />}
        {tab === "note" && <NoteTab clientEmail={clientEmail} />}
      </div>
    </div>
  );
}
