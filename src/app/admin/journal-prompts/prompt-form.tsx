"use client";

import { useActionState } from "react";
import type { JournalPromptFormState } from "@/lib/admin-actions";

const inputClass = "w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1 block text-xs font-medium text-ink/60";

export type JournalPromptRow = {
  id: string;
  dayNumber: number;
  category: string;
  text: string;
  categoryAr: string | null;
  textAr: string | null;
};

export default function PromptForm({
  action,
  prompt,
  submitLabel,
}: {
  action: (state: JournalPromptFormState, formData: FormData) => Promise<JournalPromptFormState>;
  prompt?: JournalPromptRow;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      {prompt && <input type="hidden" name="id" value={prompt.id} />}
      <div>
        <label className={labelClass} htmlFor={`dayNumber-${prompt?.id ?? "new"}`}>Day number</label>
        <input
          id={`dayNumber-${prompt?.id ?? "new"}`}
          name="dayNumber"
          type="number"
          min={1}
          required
          defaultValue={prompt?.dayNumber}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`category-${prompt?.id ?? "new"}`}>Category</label>
        <input
          id={`category-${prompt?.id ?? "new"}`}
          name="category"
          required
          defaultValue={prompt?.category}
          placeholder="e.g. Gratitude"
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor={`text-${prompt?.id ?? "new"}`}>Prompt (English)</label>
        <textarea
          id={`text-${prompt?.id ?? "new"}`}
          name="text"
          required
          rows={2}
          defaultValue={prompt?.text}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`categoryAr-${prompt?.id ?? "new"}`}>Category (Arabic, optional)</label>
        <input
          id={`categoryAr-${prompt?.id ?? "new"}`}
          name="categoryAr"
          defaultValue={prompt?.categoryAr ?? ""}
          dir="rtl"
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor={`textAr-${prompt?.id ?? "new"}`}>Prompt (Arabic, optional)</label>
        <textarea
          id={`textAr-${prompt?.id ?? "new"}`}
          name="textAr"
          rows={2}
          defaultValue={prompt?.textAr ?? ""}
          dir="rtl"
          className={inputClass}
        />
      </div>
      {state?.error && <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
