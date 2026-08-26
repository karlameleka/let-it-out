"use client";

import { useState } from "react";
import { CORE_EMOTIONS, getSecondaryEmotions, type CoreEmotionId } from "@/lib/moods";
import type { Locale } from "@/lib/i18n/locale";

/** The same core → secondary emotion picker used in the journal app's entry
 * composer — pick a core feeling to reveal its more specific secondary
 * feelings, multi-select throughout. Shared so every mood check-in in the
 * app (journaling, therapist session notes) looks and behaves identically.
 * `locale` defaults to "en" so the internal therapist dashboard (which
 * doesn't thread the site locale) always renders in English. */
export default function MoodPicker({
  moods,
  onChange,
  label = "How are you feeling?",
  hint = "pick as many as apply",
  locale = "en",
}: {
  moods: string[];
  onChange: (moods: string[]) => void;
  label?: string;
  hint?: string;
  locale?: Locale;
}) {
  const [expandedCore, setExpandedCore] = useState<CoreEmotionId | null>(null);

  function toggleMood(id: string) {
    onChange(moods.includes(id) ? moods.filter((m) => m !== id) : [...moods, id]);
  }

  function toggleCore(coreId: CoreEmotionId) {
    toggleMood(coreId);
    setExpandedCore((prev) => (prev === coreId ? null : coreId));
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
        {label} <span className="font-normal normal-case text-ink/35">{hint}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {CORE_EMOTIONS.map((core) => {
          const isSelected = moods.includes(core.id);
          const isExpanded = expandedCore === core.id;
          return (
            <button
              key={core.id}
              type="button"
              onClick={() => toggleCore(core.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
                isSelected
                  ? "border-brand-600 bg-brand-50 text-brand-800 shadow-[0_2px_0_0_theme(colors.brand.300)]"
                  : isExpanded
                    ? "border-brand-300 text-ink/80"
                    : "border-brand-100 bg-white text-ink/70 hover:border-brand-300 active:border-brand-300"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ backgroundColor: core.color }} />
              {locale === "ar" ? core.labelAr : core.label}
            </button>
          );
        })}
      </div>

      {expandedCore && (
        <div className="animate-pop-in mt-3 flex flex-wrap gap-2 rounded-xl border border-dashed border-brand-200 bg-white/60 p-3">
          {getSecondaryEmotions(expandedCore).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => toggleMood(m.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                moods.includes(m.id)
                  ? "border-brand-600 bg-white text-brand-800 shadow-sm"
                  : "border-brand-100 bg-white/60 text-ink/60 hover:border-brand-300 active:border-brand-300"
              }`}
            >
              {locale === "ar" ? m.labelAr : m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
