"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { CounselingQuizConfigData, CounselingQuizOption } from "@/lib/counseling-quiz-config";

const inputClasses =
  "w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500";

export default function CounselingQuizEditor({
  config,
  specialties,
  action,
}: {
  config: CounselingQuizConfigData;
  specialties: string[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [options, setOptions] = useState<CounselingQuizOption[]>(
    config.options.length > 0 ? config.options : [{ label: "", specialty: specialties[0] ?? "" }],
  );

  function updateOption(i: number, patch: Partial<CounselingQuizOption>) {
    setOptions((arr) => arr.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="optionsJson" value={JSON.stringify(options)} readOnly />

      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <h3 className="font-display font-semibold text-brand-900">Trigger &amp; placement</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="triggerLabel">
              Trigger button text
            </label>
            <input id="triggerLabel" name="triggerLabel" defaultValue={config.triggerLabel} className={inputClasses} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="placement">
              Where it appears on the Counseling page
            </label>
            <select id="placement" name="placement" defaultValue={config.placement} className={inputClasses}>
              <option value="ABOVE_LIST">Above the counselor list (prominent card)</option>
              <option value="BELOW_LIST">Below the &ldquo;Choose your counselor&rdquo; heading</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <h3 className="font-display font-semibold text-brand-900">Question 1 &mdash; what brings them here</h3>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="prompt">Question</label>
          <input id="prompt" name="prompt" defaultValue={config.prompt} className={inputClasses} />
        </div>

        <div className="mt-4 space-y-3">
          {options.map((opt, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/40 p-3">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink/60">Choice shown to visitors</label>
                  <input
                    value={opt.label}
                    onChange={(e) => updateOption(i, { label: e.target.value })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink/60">Matches specialty</label>
                  <select
                    value={opt.specialty}
                    onChange={(e) => updateOption(i, { specialty: e.target.value })}
                    className={inputClasses}
                  >
                    <option value="" disabled>Select…</option>
                    {specialties.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    {opt.specialty && !specialties.includes(opt.specialty) && (
                      <option value={opt.specialty}>{opt.specialty} (not used by any active therapist)</option>
                    )}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOptions((arr) => arr.filter((_, idx) => idx !== i))}
                aria-label="Remove choice"
                className="mt-6 shrink-0 text-ink/40 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setOptions((arr) => [...arr, { label: "", specialty: specialties[0] ?? "" }])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add choice
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <h3 className="font-display font-semibold text-brand-900">Question 2 &mdash; language preference</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="languagePrompt">Question</label>
            <input id="languagePrompt" name="languagePrompt" defaultValue={config.languagePrompt} className={inputClasses} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="languageAnyLabel">
              &ldquo;No preference&rdquo; option text
            </label>
            <input id="languageAnyLabel" name="languageAnyLabel" defaultValue={config.languageAnyLabel} className={inputClasses} />
          </div>
        </div>
        <p className="mt-3 text-xs text-ink/40">
          The language choices themselves come from each therapist&rsquo;s spoken languages — nothing to configure
          here.
        </p>
      </div>

      <button
        type="submit"
        className="rounded bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)]"
      >
        Save quiz
      </button>
    </form>
  );
}
