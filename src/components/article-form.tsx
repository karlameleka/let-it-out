"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Article, ArticleSection, ArticleCheckIn } from "@/lib/content/articles";

const inputClasses =
  "w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500";

type SectionDraft = {
  heading: string;
  paragraphsText: string;
  listText: string;
  headingAr: string;
  paragraphsTextAr: string;
  listTextAr: string;
};
type CheckInDraft = { prompt: string; optionsText: string; promptAr: string; optionsTextAr: string };

function sectionToDraft(s: ArticleSection, sAr?: ArticleSection): SectionDraft {
  return {
    heading: s.heading,
    paragraphsText: s.paragraphs.join("\n\n"),
    listText: (s.list ?? []).join("\n"),
    headingAr: sAr?.heading ?? "",
    paragraphsTextAr: sAr?.paragraphs.join("\n\n") ?? "",
    listTextAr: (sAr?.list ?? []).join("\n"),
  };
}
function checkInToDraft(c: ArticleCheckIn, cAr?: ArticleCheckIn): CheckInDraft {
  return {
    prompt: c.prompt,
    optionsText: c.options.join("\n"),
    promptAr: cAr?.prompt ?? "",
    optionsTextAr: cAr?.options.join("\n") ?? "",
  };
}
function draftToSection(d: SectionDraft): ArticleSection {
  const list = d.listText.split("\n").map((l) => l.trim()).filter(Boolean);
  return {
    heading: d.heading.trim(),
    paragraphs: d.paragraphsText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    ...(list.length > 0 ? { list } : {}),
  };
}
function draftToSectionAr(d: SectionDraft): ArticleSection | null {
  if (!d.headingAr.trim() && !d.paragraphsTextAr.trim()) return null;
  const list = d.listTextAr.split("\n").map((l) => l.trim()).filter(Boolean);
  return {
    heading: d.headingAr.trim(),
    paragraphs: d.paragraphsTextAr.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    ...(list.length > 0 ? { list } : {}),
  };
}
function draftToCheckIn(d: CheckInDraft): ArticleCheckIn {
  return {
    prompt: d.prompt.trim(),
    options: d.optionsText.split("\n").map((o) => o.trim()).filter(Boolean),
  };
}
function draftToCheckInAr(d: CheckInDraft): ArticleCheckIn | null {
  if (!d.promptAr.trim()) return null;
  return {
    prompt: d.promptAr.trim(),
    options: d.optionsTextAr.split("\n").map((o) => o.trim()).filter(Boolean),
  };
}

export default function ArticleForm({
  article,
  action,
}: {
  article?: Article;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [sections, setSections] = useState<SectionDraft[]>(
    article
      ? article.sections.map((s, i) => sectionToDraft(s, article.sectionsAr?.[i]))
      : [{ heading: "", paragraphsText: "", listText: "", headingAr: "", paragraphsTextAr: "", listTextAr: "" }]
  );
  const [checkIns, setCheckIns] = useState<CheckInDraft[]>(
    article ? article.checkIns.map((c, i) => checkInToDraft(c, article.checkInsAr?.[i])) : []
  );

  const sectionsAr = sections.map(draftToSectionAr);
  const checkInsAr = checkIns.map(draftToCheckInAr);
  // All-or-nothing: a partially-translated section list would misalign
  // with the English one (each check-in gates the section after it), so
  // the Arabic version only gets saved once every section/check-in has an
  // Arabic entry — otherwise it stays untranslated and the English
  // content is what shows in Arabic view for now.
  const sectionsArComplete = sections.length > 0 && sectionsAr.every((s) => s !== null);
  const checkInsArComplete = checkIns.length === 0 || checkInsAr.every((c) => c !== null);

  return (
    <form action={action} className="space-y-6">
      {article && <input type="hidden" name="id" value={article.id} />}
      <input type="hidden" name="sectionsJson" value={JSON.stringify(sections.map(draftToSection))} readOnly />
      <input type="hidden" name="checkInsJson" value={JSON.stringify(checkIns.map(draftToCheckIn))} readOnly />
      <input
        type="hidden"
        name="sectionsArJson"
        value={sectionsArComplete ? JSON.stringify(sectionsAr) : ""}
        readOnly
      />
      <input
        type="hidden"
        name="checkInsArJson"
        value={sectionsArComplete && checkInsArComplete ? JSON.stringify(checkInsAr) : ""}
        readOnly
      />

      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="title">Title</label>
            <input id="title" name="title" required defaultValue={article?.title} className={inputClasses} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="titleAr">
              Title <span className="font-normal text-ink/40">(Arabic, optional)</span>
            </label>
            <input id="titleAr" name="titleAr" dir="rtl" defaultValue={article?.titleAr ?? ""} className={inputClasses} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="excerpt">Excerpt</label>
            <textarea id="excerpt" name="excerpt" required rows={2} defaultValue={article?.excerpt} className={inputClasses} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="excerptAr">
              Excerpt <span className="font-normal text-ink/40">(Arabic, optional)</span>
            </label>
            <textarea
              id="excerptAr"
              name="excerptAr"
              dir="rtl"
              rows={2}
              defaultValue={article?.excerptAr ?? ""}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="category">Category</label>
            <input id="category" name="category" required defaultValue={article?.category} className={inputClasses} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="readMinutes">Read minutes</label>
            <input
              id="readMinutes"
              name="readMinutes"
              type="number"
              min={1}
              required
              defaultValue={article?.readMinutes ?? 5}
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-brand-900">Sections</h3>
          <button
            type="button"
            onClick={() =>
              setSections((s) => [
                ...s,
                { heading: "", paragraphsText: "", listText: "", headingAr: "", paragraphsTextAr: "", listTextAr: "" },
              ])
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add section
          </button>
        </div>

        {sections.map((s, i) => (
          <div key={i} className="rounded-2xl border border-brand-100 bg-white p-5">
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
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor={`section-${i}-heading`}>Heading</label>
                <input
                  id={`section-${i}-heading`}
                  value={s.heading}
                  onChange={(e) =>
                    setSections((arr) => arr.map((x, idx) => (idx === i ? { ...x, heading: e.target.value } : x)))
                  }
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor={`section-${i}-paragraphs`}>
                  Paragraphs <span className="font-normal text-ink/40">(leave a blank line between paragraphs)</span>
                </label>
                <textarea
                  id={`section-${i}-paragraphs`}
                  rows={6}
                  value={s.paragraphsText}
                  onChange={(e) =>
                    setSections((arr) =>
                      arr.map((x, idx) => (idx === i ? { ...x, paragraphsText: e.target.value } : x))
                    )
                  }
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor={`section-${i}-list`}>
                  Bulleted list <span className="font-normal text-ink/40">(optional, one item per line)</span>
                </label>
                <textarea
                  id={`section-${i}-list`}
                  rows={3}
                  value={s.listText}
                  onChange={(e) =>
                    setSections((arr) => arr.map((x, idx) => (idx === i ? { ...x, listText: e.target.value } : x)))
                  }
                  className={inputClasses}
                />
              </div>
              <div className="rounded-xl border border-dashed border-brand-200 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
                  Arabic (optional — fill in every section to publish an Arabic version)
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor={`section-${i}-headingAr`}>
                      Heading
                    </label>
                    <input
                      id={`section-${i}-headingAr`}
                      dir="rtl"
                      value={s.headingAr}
                      onChange={(e) =>
                        setSections((arr) => arr.map((x, idx) => (idx === i ? { ...x, headingAr: e.target.value } : x)))
                      }
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor={`section-${i}-paragraphsAr`}>
                      Paragraphs
                    </label>
                    <textarea
                      id={`section-${i}-paragraphsAr`}
                      dir="rtl"
                      rows={6}
                      value={s.paragraphsTextAr}
                      onChange={(e) =>
                        setSections((arr) =>
                          arr.map((x, idx) => (idx === i ? { ...x, paragraphsTextAr: e.target.value } : x))
                        )
                      }
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor={`section-${i}-listAr`}>
                      Bulleted list
                    </label>
                    <textarea
                      id={`section-${i}-listAr`}
                      dir="rtl"
                      rows={3}
                      value={s.listTextAr}
                      onChange={(e) =>
                        setSections((arr) => arr.map((x, idx) => (idx === i ? { ...x, listTextAr: e.target.value } : x)))
                      }
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-brand-900">Check-ins</h3>
            <p className="text-xs text-ink/50">One check-in gates each section after the first, in order.</p>
          </div>
          <button
            type="button"
            onClick={() => setCheckIns((c) => [...c, { prompt: "", optionsText: "", promptAr: "", optionsTextAr: "" }])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add check-in
          </button>
        </div>

        {checkIns.map((c, i) => (
          <div key={i} className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Check-in {i + 1}</p>
              <button
                type="button"
                onClick={() => setCheckIns((arr) => arr.filter((_, idx) => idx !== i))}
                aria-label="Remove check-in"
                className="text-ink/40 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink/60">Prompt</label>
                <input
                  value={c.prompt}
                  onChange={(e) =>
                    setCheckIns((arr) => arr.map((x, idx) => (idx === i ? { ...x, prompt: e.target.value } : x)))
                  }
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink/60">Options (one per line)</label>
                <textarea
                  rows={3}
                  value={c.optionsText}
                  onChange={(e) =>
                    setCheckIns((arr) =>
                      arr.map((x, idx) => (idx === i ? { ...x, optionsText: e.target.value } : x))
                    )
                  }
                  className={inputClasses}
                />
              </div>
              <div className="rounded-xl border border-dashed border-brand-200 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
                  Arabic (optional — fill in every check-in to publish an Arabic version)
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-ink/60">Prompt</label>
                    <input
                      dir="rtl"
                      value={c.promptAr}
                      onChange={(e) =>
                        setCheckIns((arr) => arr.map((x, idx) => (idx === i ? { ...x, promptAr: e.target.value } : x)))
                      }
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-ink/60">Options (one per line)</label>
                    <textarea
                      dir="rtl"
                      rows={3}
                      value={c.optionsTextAr}
                      onChange={(e) =>
                        setCheckIns((arr) =>
                          arr.map((x, idx) => (idx === i ? { ...x, optionsTextAr: e.target.value } : x))
                        )
                      }
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="references">
          References <span className="font-normal text-ink/40">(one per line)</span>
        </label>
        <textarea
          id="references"
          name="references"
          rows={4}
          defaultValue={article?.references.join("\n")}
          className={inputClasses}
        />
      </div>

      <button
        type="submit"
        className="rounded bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)]"
      >
        {article ? "Save changes" : "Publish article"}
      </button>
    </form>
  );
}
