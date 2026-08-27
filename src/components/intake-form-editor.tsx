"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { IntakeField, IntakeFieldType, IntakeSection } from "@/lib/intake-form-schema";

const inputClasses =
  "w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500";

const FIELD_TYPES: IntakeFieldType[] = ["text", "textarea", "tel", "date", "select", "yesno", "scale"];

function emptyField(): IntakeField {
  return { name: "", label: "", type: "text" };
}
function emptySection(): IntakeSection {
  return { id: `section-${Date.now()}`, title: "", fields: [emptyField()] };
}

function FieldEditor({
  field,
  dir,
  onChange,
  onRemove,
}: {
  field: IntakeField;
  dir?: "rtl";
  onChange: (f: IntakeField) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4" dir={dir}>
      <div className="flex items-start justify-between gap-3">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">Question / label</label>
            <input
              dir={dir}
              value={field.label}
              onChange={(e) => onChange({ ...field, label: e.target.value })}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">
              Field key <span className="font-normal text-ink/40">(no spaces, used internally)</span>
            </label>
            <input
              value={field.name}
              onChange={(e) => onChange({ ...field, name: e.target.value.replace(/\s+/g, "") })}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60">Answer type</label>
            <select
              value={field.type}
              onChange={(e) => onChange({ ...field, type: e.target.value as IntakeFieldType })}
              className={inputClasses}
            >
              {FIELD_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={field.required ?? false}
                onChange={(e) => onChange({ ...field, required: e.target.checked })}
                className="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-400"
              />
              Required
            </label>
          </div>
          {field.type === "select" && (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink/60">Options (one per line)</label>
              <textarea
                dir={dir}
                rows={2}
                value={(field.options ?? []).join("\n")}
                onChange={(e) =>
                  onChange({ ...field, options: e.target.value.split("\n").map((o) => o.trim()).filter(Boolean) })
                }
                className={inputClasses}
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink/60">Help text (optional)</label>
            <input
              dir={dir}
              value={field.helpText ?? ""}
              onChange={(e) => onChange({ ...field, helpText: e.target.value || undefined })}
              className={inputClasses}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink/60">
              Only show if this field key answered &ldquo;Yes&rdquo; <span className="font-normal text-ink/40">(optional)</span>
            </label>
            <input
              value={field.showIfYes ?? ""}
              onChange={(e) => onChange({ ...field, showIfYes: e.target.value || undefined })}
              className={inputClasses}
            />
          </div>
        </div>
        <button type="button" onClick={onRemove} aria-label="Remove field" className="mt-1 shrink-0 text-ink/40 hover:text-red-600">
          <Trash2 className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/** One full section/field tree editor — used twice by IntakeFormEditor
 * below (once for the English sections, once for the fully independent
 * Arabic sections), so this owns nothing about which language it is beyond
 * the optional `dir="rtl"` passed down to its text inputs. */
function SectionsEditor({
  sections,
  setSections,
  dir,
  addSectionLabel,
}: {
  sections: IntakeSection[];
  setSections: (updater: (arr: IntakeSection[]) => IntakeSection[]) => void;
  dir?: "rtl";
  addSectionLabel: string;
}) {
  function updateSection(i: number, patch: Partial<IntakeSection>) {
    setSections((arr) => arr.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <div key={section.id} className="rounded-2xl border border-brand-100 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Section {i + 1}</p>
            <button
              type="button"
              onClick={() => setSections((arr) => arr.filter((_, idx) => idx !== i))}
              aria-label="Remove section"
              className="text-ink/40 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor={`${section.id}-title`}>Section title</label>
              <input
                id={`${section.id}-title`}
                dir={dir}
                value={section.title}
                onChange={(e) => updateSection(i, { title: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor={`${section.id}-description`}>Description (optional)</label>
              <input
                id={`${section.id}-description`}
                dir={dir}
                value={section.description ?? ""}
                onChange={(e) => updateSection(i, { description: e.target.value || undefined })}
                className={inputClasses}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor={`${section.id}-note`}>
                Callout note (optional) <span className="font-normal text-ink/40">— shown in a highlighted box, e.g. crisis-line info</span>
              </label>
              <input
                id={`${section.id}-note`}
                dir={dir}
                value={section.note ?? ""}
                onChange={(e) => updateSection(i, { note: e.target.value || undefined })}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {section.fields.map((field, fi) => (
              <FieldEditor
                key={fi}
                field={field}
                dir={dir}
                onChange={(f) =>
                  updateSection(i, { fields: section.fields.map((x, idx) => (idx === fi ? f : x)) })
                }
                onRemove={() => updateSection(i, { fields: section.fields.filter((_, idx) => idx !== fi) })}
              />
            ))}
            <button
              type="button"
              onClick={() => updateSection(i, { fields: [...section.fields, emptyField()] })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add question
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setSections((arr) => [...arr, emptySection()])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 px-3.5 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
      >
        <Plus className="h-4 w-4" strokeWidth={2} /> {addSectionLabel}
      </button>
    </div>
  );
}

export default function IntakeFormEditor({
  sections: initialSections,
  sectionsAr: initialSectionsAr,
  action,
}: {
  sections: IntakeSection[];
  sectionsAr: IntakeSection[];
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [sections, setSections] = useState<IntakeSection[]>(
    initialSections.length > 0 ? initialSections : [emptySection()]
  );
  const [sectionsAr, setSectionsAr] = useState<IntakeSection[]>(initialSectionsAr);
  const [showArabic, setShowArabic] = useState(initialSectionsAr.length > 0);

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="sectionsJson" value={JSON.stringify(sections)} readOnly />
      <input type="hidden" name="sectionsArJson" value={JSON.stringify(showArabic ? sectionsAr : [])} readOnly />

      <SectionsEditor sections={sections} setSections={setSections} addSectionLabel="Add section" />

      <div className="rounded-2xl border border-dashed border-brand-300 bg-brand-50/40 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-semibold text-brand-900">Arabic version</h3>
            <p className="mt-1 text-xs text-ink/50">
              Fully independent from the English form above — its own sections and questions, own order, own
              field count. Whichever version a client actually filled out is what a submission is parsed
              against, so nothing here needs to mirror the English side one-to-one.
            </p>
          </div>
          {!showArabic && (
            <button
              type="button"
              onClick={() => {
                setSectionsAr((arr) => (arr.length > 0 ? arr : [emptySection()]));
                setShowArabic(true);
              }}
              className="shrink-0 rounded-lg border border-brand-300 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
            >
              Add Arabic version
            </button>
          )}
        </div>

        {showArabic && (
          <div className="mt-4 space-y-4">
            <SectionsEditor sections={sectionsAr} setSections={setSectionsAr} dir="rtl" addSectionLabel="أضف قسم" />
            <button
              type="button"
              onClick={() => {
                setSectionsAr([]);
                setShowArabic(false);
              }}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Remove Arabic version (Arabic-locale clients will see the English form)
            </button>
          </div>
        )}
      </div>

      <div>
        <button
          type="submit"
          className="rounded bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)]"
        >
          Save intake form
        </button>
      </div>
    </form>
  );
}
