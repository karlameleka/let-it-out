"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";

type Counselor = {
  id: string;
  slug: string;
  name: string;
  credentials: string;
  specialties: string[];
  languages: string[];
  photoUrl: string | null;
  availabilityStatus: "AVAILABLE" | "WAITLIST" | "UNAVAILABLE";
};

function AvailabilityBadge({
  status,
  dict,
}: {
  status: Counselor["availabilityStatus"];
  dict: Dictionary["counseling"];
}) {
  if (status === "AVAILABLE") return null;
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        status === "WAITLIST" ? "bg-amber-100 text-amber-800" : "bg-ink/10 text-ink/60"
      }`}
    >
      {status === "WAITLIST" ? dict.waitlistBadge : dict.unavailableBadge}
    </span>
  );
}

type Step = "concern" | "language" | "results";

export default function CounselorFinder({
  counselors,
  dict,
}: {
  counselors: Counselor[];
  dict: Dictionary;
}) {
  const t = dict.counseling;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("concern");
  const [concern, setConcern] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);

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

  const languageOptions = useMemo(
    () => [...new Set(counselors.flatMap((c) => c.languages))],
    [counselors]
  );

  const results = useMemo(
    () =>
      counselors.filter(
        (c) =>
          (!concern || c.specialties.includes(concern)) &&
          (!language || language === "ANY" || c.languages.includes(language))
      ),
    [counselors, concern, language]
  );

  function openQuiz() {
    setStep("concern");
    setConcern(null);
    setLanguage(null);
    setOpen(true);
  }

  function pickConcern(specialty: string) {
    setConcern(specialty);
    setStep("language");
  }

  function pickLanguage(lang: string | null) {
    setLanguage(lang ?? "ANY");
    setStep("results");
  }

  return (
    <>
      <button
        type="button"
        onClick={openQuiz}
        className="mt-4 text-sm font-medium text-brand-600 underline decoration-brand-300 underline-offset-4 hover:text-brand-700"
      >
        {t.notSureLink}
      </button>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {counselors.map((c) => (
          <Link
            key={c.id}
            href={`/counseling/${c.slug}`}
            className="group flex flex-col rounded-2xl border-[1.5px] border-brand-900 bg-white p-7 transition-colors duration-300 hover:bg-brand-900 active:bg-brand-900"
          >
            {c.photoUrl ? (
              <Image
                src={c.photoUrl}
                alt={c.name}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full border-2 border-brand-200 object-cover transition-colors duration-300 group-hover:border-white/30 group-active:border-white/30"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 font-display text-lg font-semibold text-brand-700 transition-colors duration-300 group-hover:border-white/30 group-hover:bg-white/10 group-hover:text-white group-active:border-white/30 group-active:bg-white/10 group-active:text-white">
                {c.name.split(" ").map((n) => n[0]).join("")}
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-semibold text-brand-900 transition-colors duration-300 group-hover:text-white group-active:text-white">{c.name}</h3>
              <AvailabilityBadge status={c.availabilityStatus} dict={t} />
            </div>
            <p className="mt-1 text-sm text-ink/60 transition-colors duration-300 group-hover:text-white/70 group-active:text-white/70">{c.credentials}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.specialties.slice(0, 3).map((s) => (
                <span key={s} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors duration-300 group-hover:bg-white/10 group-hover:text-white group-active:bg-white/10 group-active:text-white">
                  {s}
                </span>
              ))}
            </div>
            {c.languages.length > 0 && (
              <p className="mt-3 text-xs text-ink/50 transition-colors duration-300 group-hover:text-white/60 group-active:text-white/60">
                <span className="font-medium text-ink/60 transition-colors duration-300 group-hover:text-white/80 group-active:text-white/80">{t.speaks}:</span> {c.languages.join(", ")}
              </p>
            )}
            <p className="mt-4 text-sm font-medium text-brand-600 link-grow w-fit transition-colors duration-300 group-hover:text-white group-active:text-white">
              {t.viewProfileCta} &rarr;
            </p>
          </Link>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="animate-pop-in w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                {step !== "results" ? (
                  <>
                    {t.quizStep} {step === "concern" ? 1 : 2} {t.quizOf} 2
                  </>
                ) : (
                  t.quizResultsTitle
                )}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-1 text-ink/40 transition-colors hover:bg-brand-50 hover:text-ink/70"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              {step === "concern" && (
                <>
                  <p className="text-sm font-medium text-ink/80">{t.quizPrompt}</p>
                  <div className="mt-3 flex flex-col gap-2">
                    {CONCERNS.map((c) => (
                      <button
                        key={c.specialty}
                        type="button"
                        onClick={() => pickConcern(c.specialty)}
                        className="rounded-xl border border-brand-200 px-4 py-3 text-left text-sm font-medium text-ink/80 transition-colors hover:border-brand-400 hover:bg-brand-50 active:border-brand-400 active:bg-brand-50"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === "language" && (
                <>
                  <p className="text-sm font-medium text-ink/80">{t.quizLanguagePrompt}</p>
                  <div className="mt-3 flex flex-col gap-2">
                    {languageOptions.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => pickLanguage(lang)}
                        className="rounded-xl border border-brand-200 px-4 py-3 text-left text-sm font-medium text-ink/80 transition-colors hover:border-brand-400 hover:bg-brand-50 active:border-brand-400 active:bg-brand-50"
                      >
                        {lang}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => pickLanguage(null)}
                      className="rounded-xl border border-dashed border-brand-200 px-4 py-3 text-left text-sm font-medium text-ink/60 transition-colors hover:border-brand-400 hover:bg-brand-50 active:border-brand-400 active:bg-brand-50"
                    >
                      {t.quizLanguageAny}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("concern")}
                    className="mt-4 text-sm font-medium text-brand-600 underline"
                  >
                    &larr; {t.quizBack}
                  </button>
                </>
              )}

              {step === "results" && (
                <>
                  {results.length === 0 ? (
                    <p className="text-sm text-ink/60">
                      {t.emptyStateText}{" "}
                      <Link href="/contact" className="font-medium text-brand-600 underline" onClick={() => setOpen(false)}>
                        {t.emptyStateLink}
                      </Link>{" "}
                      {t.emptyStateSuffix}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {results.map((c) => (
                        <Link
                          key={c.id}
                          href={`/counseling/${c.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 rounded-xl border border-brand-200 p-3 transition-colors hover:border-brand-400 hover:bg-brand-50 active:border-brand-400 active:bg-brand-50"
                        >
                          {c.photoUrl ? (
                            <Image
                              src={c.photoUrl}
                              alt={c.name}
                              width={44}
                              height={44}
                              className="h-11 w-11 shrink-0 rounded-full border border-brand-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-brand-50 font-display text-sm font-semibold text-brand-700">
                              {c.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-display text-sm font-semibold text-brand-900">{c.name}</p>
                              <AvailabilityBadge status={c.availabilityStatus} dict={t} />
                            </div>
                            <p className="truncate text-xs text-ink/60">{c.credentials}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={openQuiz}
                    className="mt-4 text-sm font-medium text-brand-600 underline"
                  >
                    {t.quizStartOver}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
