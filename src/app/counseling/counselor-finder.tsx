"use client";

import { useState } from "react";
import Link from "next/link";

type Counselor = {
  id: string;
  slug: string;
  name: string;
  credentials: string;
  specialties: string[];
};

// A friendlier, presenting-concern framing of a subset of the specialty
// tags — not every specialty is something a visitor would self-identify
// with (e.g. "CBT" or "Adult Mental Health" describe a method or scope,
// not a concern), so this is curated rather than derived automatically.
const CONCERNS = [
  { label: "Stress or burnout", specialty: "Stress & Burnout" },
  { label: "Feeling low or depressed", specialty: "Depression" },
  { label: "Anxious or overwhelmed", specialty: "Anxiety" },
  { label: "Trouble managing emotions", specialty: "Emotional Dysregulation" },
  { label: "Relationship or intimacy concerns", specialty: "Psychosexual Therapy" },
];

export default function CounselorFinder({ counselors }: { counselors: Counselor[] }) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [concern, setConcern] = useState<string | null>(null);

  const filtered = concern ? counselors.filter((c) => c.specialties.includes(concern)) : counselors;

  return (
    <>
      {!showQuiz ? (
        <button
          type="button"
          onClick={() => setShowQuiz(true)}
          className="mt-4 text-sm font-medium text-brand-600 underline decoration-brand-300 underline-offset-4 hover:text-brand-700"
        >
          Not sure who to pick?
        </button>
      ) : (
        <div className="animate-pop-in mt-4 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 p-5">
          <p className="text-sm font-medium text-ink/80">What are you looking for?</p>
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
              Showing counselors who work with {concern.toLowerCase()}.{" "}
              <button type="button" onClick={() => setConcern(null)} className="font-medium text-brand-600 underline">
                Clear
              </button>
            </p>
          )}
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="col-span-full text-sm text-ink/60">
            No counselor matches that specifically, but reach out through our{" "}
            <Link href="/contact" className="font-medium text-brand-600 underline">
              contact page
            </Link>{" "}
            and we&apos;ll help you find the right fit.
          </p>
        ) : (
          filtered.map((c) => (
            <Link
              key={c.id}
              href={`/counseling/${c.slug}`}
              className="group flex flex-col rounded-2xl border-2 border-brand-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 font-display text-lg font-semibold text-brand-700">
                {c.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-brand-900">{c.name}</h3>
              <p className="mt-1 text-sm text-ink/60">{c.credentials}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.specialties.slice(0, 3).map((s) => (
                  <span key={s} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm font-medium text-brand-600 link-grow w-fit">
                View profile &amp; book &rarr;
              </p>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
