"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionary";

type Counselor = {
  id: string;
  slug: string;
  name: string;
  credentials: string;
  specialties: string[];
  languages: string[];
  photoUrl: string | null;
};

export default function CounselorFinder({
  counselors,
  dict,
}: {
  counselors: Counselor[];
  dict: Dictionary;
}) {
  const t = dict.counseling;
  const [showQuiz, setShowQuiz] = useState(false);
  const [concern, setConcern] = useState<string | null>(null);

  // A friendlier, presenting-concern framing of a subset of the specialty
  // tags — not every specialty is something a visitor would self-identify
  // with (e.g. "CBT" or "Adult Mental Health" describe a method or scope,
  // not a concern), so this is curated rather than derived automatically.
  const CONCERNS = [
    { label: t.concernStress, specialty: "Stress & Burnout" },
    { label: t.concernDepression, specialty: "Depression" },
    { label: t.concernAnxiety, specialty: "Anxiety" },
    { label: t.concernEmotional, specialty: "Emotional Dysregulation" },
    { label: t.concernRelationship, specialty: "Psychosexual Therapy" },
  ];

  const filtered = concern ? counselors.filter((c) => c.specialties.includes(concern)) : counselors;
  const concernLabel = CONCERNS.find((c) => c.specialty === concern)?.label;

  return (
    <>
      {!showQuiz ? (
        <button
          type="button"
          onClick={() => setShowQuiz(true)}
          className="mt-4 text-sm font-medium text-brand-600 underline decoration-brand-300 underline-offset-4 hover:text-brand-700"
        >
          {t.notSureLink}
        </button>
      ) : (
        <div className="animate-pop-in mt-4 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 p-5">
          <p className="text-sm font-medium text-ink/80">{t.quizPrompt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CONCERNS.map((c) => (
              <button
                key={c.specialty}
                type="button"
                onClick={() => setConcern(concern === c.specialty ? null : c.specialty)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  concern === c.specialty
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-brand-200 bg-white text-ink/70 hover:border-brand-400"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          {concern && (
            <p className="mt-3 text-xs text-ink/50">
              {t.showingResultsPrefix} {concernLabel?.toLowerCase()}.{" "}
              <button type="button" onClick={() => setConcern(null)} className="font-medium text-brand-600 underline">
                {t.clear}
              </button>
            </p>
          )}
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="col-span-full text-sm text-ink/60">
            {t.emptyStateText}{" "}
            <Link href="/contact" className="font-medium text-brand-600 underline">
              {t.emptyStateLink}
            </Link>{" "}
            {t.emptyStateSuffix}
          </p>
        ) : (
          filtered.map((c) => (
            <Link
              key={c.id}
              href={`/counseling/${c.slug}`}
              className="group flex flex-col rounded-2xl border-[1.5px] border-brand-900 bg-white p-7 transition-colors duration-300 hover:bg-brand-900"
            >
              {c.photoUrl ? (
                <Image
                  src={c.photoUrl}
                  alt={c.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full border-2 border-brand-200 object-cover transition-colors duration-300 group-hover:border-white/30"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 font-display text-lg font-semibold text-brand-700 transition-colors duration-300 group-hover:border-white/30 group-hover:bg-white/10 group-hover:text-white">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
              )}
              <h3 className="mt-4 font-display text-lg font-semibold text-brand-900 transition-colors duration-300 group-hover:text-white">{c.name}</h3>
              <p className="mt-1 text-sm text-ink/60 transition-colors duration-300 group-hover:text-white/70">{c.credentials}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.specialties.slice(0, 3).map((s) => (
                  <span key={s} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors duration-300 group-hover:bg-white/10 group-hover:text-white">
                    {s}
                  </span>
                ))}
              </div>
              {c.languages.length > 0 && (
                <p className="mt-3 text-xs text-ink/50 transition-colors duration-300 group-hover:text-white/60">
                  <span className="font-medium text-ink/60 transition-colors duration-300 group-hover:text-white/80">{t.speaks}:</span> {c.languages.join(", ")}
                </p>
              )}
              <p className="mt-4 text-sm font-medium text-brand-600 link-grow w-fit transition-colors duration-300 group-hover:text-white">
                {t.viewProfileCta} &rarr;
              </p>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
