"use client";

import { useEffect, useState } from "react";
import { Shuffle, ArrowRight, ArrowLeft, Check, Sparkles, Info } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui";
import {
  REFRAMING_PROMPTS,
  COGNITIVE_DISTORTIONS,
  EMOTIONS,
  INTENSITY_LABELS,
  INTENSITY_LABELS_AR,
  type ReframingPrompt,
} from "@/lib/content/reframing";
import { recordCbtCompletion } from "@/lib/cbt-streak";
import { saveCbtEntry } from "@/lib/cbt-history";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

const STORAGE_KEY = "lio_reframe_count";

function randomPrompt(excludeSituation?: string): ReframingPrompt {
  const pool = REFRAMING_PROMPTS.filter((p) => p.situation !== excludeSituation);
  const source = pool.length > 0 ? pool : REFRAMING_PROMPTS;
  return source[Math.floor(Math.random() * source.length)];
}

type Step = 0 | 1 | 2 | 3 | 4;

export default function ReframingTool({ dict, locale }: { dict: Dictionary["reframingTool"]; locale: Locale }) {
  const isAr = locale === "ar";
  const intensityLabels = isAr ? INTENSITY_LABELS_AR : INTENSITY_LABELS;
  // Starts on a fixed first prompt (not a random one) so server and client
  // render identically, then shuffles to a random one after mount — using
  // Math.random() during the initial render would pick different scenarios
  // on the server vs. the client and cause a hydration mismatch.
  const [prompt, setPrompt] = useState<ReframingPrompt>(REFRAMING_PROMPTS[0]);
  const [step, setStep] = useState<Step>(0);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [intensityBefore, setIntensityBefore] = useState<number | null>(null);
  const [intensityAfter, setIntensityAfter] = useState<number | null>(null);
  const [distortions, setDistortions] = useState<Set<string>>(new Set());
  const [evidenceFor, setEvidenceFor] = useState("");
  const [evidenceAgainst, setEvidenceAgainst] = useState("");
  const [reframe, setReframe] = useState("");
  const [count, setCount] = useState<number | null>(null);
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCount(Number(window.localStorage.getItem(STORAGE_KEY) ?? "0"));
    setPrompt(randomPrompt());
  }, []);

  function shuffle() {
    setPrompt((prev) => randomPrompt(prev.situation));
  }

  function startOver(newPrompt: boolean) {
    setStep(0);
    setFeeling(null);
    setIntensityBefore(null);
    setIntensityAfter(null);
    setDistortions(new Set());
    setEvidenceFor("");
    setEvidenceAgainst("");
    setReframe("");
    if (newPrompt) shuffle();
  }

  function toggleDistortion(id: string) {
    setDistortions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function finish() {
    const next = (count ?? 0) + 1;
    setCount(next);
    window.localStorage.setItem(STORAGE_KEY, String(next));
    setStreak(recordCbtCompletion().streak);
    saveCbtEntry({
      type: "reframing",
      summary: reframe.trim(),
      data: {
        situation: prompt.situation,
        automaticThought: prompt.thought,
        feeling: EMOTIONS.find((e) => e.id === feeling)?.label ?? "",
        distortions: COGNITIVE_DISTORTIONS.filter((d) => distortions.has(d.id))
          .map((d) => d.label)
          .join(", "),
        evidenceFor,
        evidenceAgainst,
        reframe,
      },
    });
    setStep(4);
  }

  const feelingLabel = isAr ? EMOTIONS.find((e) => e.id === feeling)?.labelAr : EMOTIONS.find((e) => e.id === feeling)?.label;

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-sm">
      {step < 4 && (
        <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50 px-6 py-3 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            {dict.stepOf.replace("{current}", String(step + 1))}
          </p>
          {count !== null && count > 0 && (
            <p className="text-xs text-ink/40">
              {(count === 1 ? dict.reframeSoFar : dict.reframesSoFar).replace("{n}", String(count))}
            </p>
          )}
        </div>
      )}

      <div className="p-6 sm:p-8">
        {step === 0 && (
          <>
            <div className="flex items-start gap-2.5 rounded-xl bg-brand-50/70 p-4 text-sm text-ink/70">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" strokeWidth={2} />
              <p>{dict.infoText}</p>
            </div>

            <div className="mt-5 flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                {isAr ? prompt.categoryAr : prompt.category}
              </p>
              <button
                type="button"
                onClick={shuffle}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:border-brand-400 active:border-brand-400 hover:bg-brand-50 active:bg-brand-50"
              >
                <Shuffle className="h-3.5 w-3.5" strokeWidth={2} />
                {dict.shuffle}
              </button>
            </div>
            <p className="mt-3 text-sm text-ink/70">{isAr ? prompt.situationAr : prompt.situation}</p>
            <p className="mt-3 rounded-xl border border-dashed border-brand-200 bg-brand-50/60 p-4 font-display text-lg italic leading-snug text-brand-900">
              &ldquo;{isAr ? prompt.thoughtAr : prompt.thought}&rdquo;
            </p>
            <p className="mt-4 text-sm text-ink/60">{dict.pickClosest}</p>

            <div className="mt-6 border-t border-brand-100 pt-5">
              <p className="font-display text-lg font-medium text-brand-900">{dict.feelingQuestion}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {EMOTIONS.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setFeeling(e.id)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      feeling === e.id
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-brand-200 text-ink/70 hover:border-brand-400 active:border-brand-400 hover:bg-brand-50 active:bg-brand-50"
                    }`}
                  >
                    {isAr ? e.labelAr : e.label}
                  </button>
                ))}
              </div>
              {feeling && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-ink/60">{dict.howStrong}</p>
                  <IntensityPicker value={intensityBefore} onChange={setIntensityBefore} labels={intensityLabels} />
                </div>
              )}
            </div>

            <Button
              onClick={() => setStep(1)}
              disabled={!feeling || intensityBefore === null}
              className="mt-6"
            >
              {dict.continue}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Button>
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{dict.step2Label}</p>
            <p className="mt-2 font-display text-lg font-medium text-brand-900">{dict.step2Question}</p>
            <p className="mt-1 text-sm text-ink/60">{dict.step2Hint}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {COGNITIVE_DISTORTIONS.map((d) => {
                const active = distortions.has(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDistortion(d.id)}
                    title={isAr ? d.descriptionAr : d.description}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                      active
                        ? "border-brand-600 bg-brand-50 text-brand-800"
                        : "border-brand-200 text-ink/70 hover:border-brand-400 active:border-brand-400 hover:bg-brand-50 active:bg-brand-50"
                    }`}
                  >
                    <span className="font-medium">{isAr ? d.labelAr : d.label}</span>
                    <span className="mt-0.5 block text-xs text-ink/50">{isAr ? d.descriptionAr : d.description}</span>
                  </button>
                );
              })}
            </div>
            <StepNav
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
              backLabel={dict.back}
              nextLabel={distortions.size === 0 ? dict.skip : dict.next}
            />
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{dict.step3Label}</p>
            <p className="mt-2 font-display text-lg font-medium text-brand-900">{dict.step3Question}</p>
            <p className="mt-1 text-sm text-ink/60">{dict.step3Hint}</p>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="evidenceFor" className="mb-1.5 block text-xs font-semibold text-ink/60">
                  {dict.supportsLabel}
                </label>
                <textarea
                  id="evidenceFor"
                  rows={3}
                  value={evidenceFor}
                  onChange={(e) => setEvidenceFor(e.target.value)}
                  placeholder={dict.supportsPlaceholder}
                  className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label htmlFor="evidenceAgainst" className="mb-1.5 block text-xs font-semibold text-ink/60">
                  {dict.againstLabel}
                </label>
                <textarea
                  id="evidenceAgainst"
                  rows={3}
                  value={evidenceAgainst}
                  onChange={(e) => setEvidenceAgainst(e.target.value)}
                  placeholder={dict.againstPlaceholder}
                  className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
                />
              </div>
            </div>
            <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} backLabel={dict.back} nextLabel={dict.next} />
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">{dict.step4Label}</p>
            <p className="mt-2 font-display text-lg font-medium text-brand-900">{dict.step4Question}</p>
            <p className="mt-1 text-sm text-ink/60">{dict.step4Hint}</p>
            <textarea
              rows={3}
              value={reframe}
              onChange={(e) => setReframe(e.target.value)}
              placeholder={dict.reframePlaceholder}
              className="mt-4 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
            />

            {reframe.trim() && feeling && (
              <div className="mt-5 border-t border-brand-100 pt-5">
                <p className="text-sm font-medium text-ink/80">
                  {dict.afterFeelingQuestion.replace("{feeling}", (feelingLabel ?? "").toLowerCase())}
                </p>
                <IntensityPicker value={intensityAfter} onChange={setIntensityAfter} labels={intensityLabels} />
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-ink/60 hover:text-ink/80 active:text-ink/80"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                {dict.back}
              </button>
              <Button onClick={finish} disabled={!reframe.trim()}>
                {dict.finish}
                <Check className="h-4 w-4" strokeWidth={2} />
              </Button>
            </div>
          </>
        )}

        {step === 4 && (
          <div className="animate-pop-in">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white">
              <Sparkles className="h-5 w-5" strokeWidth={2} />
            </span>
            <p className="mt-3 font-display text-lg font-semibold text-brand-900">{dict.doneTitle}</p>
            <p className="mt-1 text-sm text-ink/60">
              {streak !== null && streak > 1 && dict.streakLine.replace("{n}", String(streak))}
              {count !== null &&
                count > 0 &&
                (count === 1 ? dict.reframeSoFar : dict.reframesSoFar).replace("{n}", String(count)) + " "}
              {dict.hereIsWhatWorkedThrough}
            </p>

            <div className="mt-4 space-y-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-5 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">{dict.originalThoughtLabel}</p>
                <p className="mt-1 italic text-ink/80">&ldquo;{isAr ? prompt.thoughtAr : prompt.thought}&rdquo;</p>
              </div>
              {feeling && intensityBefore !== null && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">{dict.howItFeltLabel}</p>
                  <p className="mt-1 text-ink/80">
                    {feelingLabel} — {intensityLabels[intensityBefore]}
                    {intensityAfter !== null && (
                      <>
                        {" "}&rarr; <span className="font-medium text-brand-700">{intensityLabels[intensityAfter]}</span>{" "}
                        {dict.afterReframing}
                      </>
                    )}
                  </p>
                </div>
              )}
              {distortions.size > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">{dict.thinkingTrapsSpottedLabel}</p>
                  <p className="mt-1 text-ink/80">
                    {COGNITIVE_DISTORTIONS.filter((d) => distortions.has(d.id))
                      .map((d) => (isAr ? d.labelAr : d.label))
                      .join(", ")}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">{dict.reframedThoughtLabel}</p>
                <p className="mt-1 font-medium text-brand-800">&ldquo;{reframe}&rdquo;</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-ink/40">{dict.savedPrivately}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button onClick={() => startOver(true)}>
                <Shuffle className="h-4 w-4" strokeWidth={2} />
                {dict.tryAnotherScenario}
              </Button>
              <ButtonLink href="/counseling" variant="text">
                {dict.talkToCounselor} &rarr;
              </ButtonLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IntensityPicker({
  value,
  onChange,
  labels,
}: {
  value: number | null;
  onChange: (v: number) => void;
  labels: string[];
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {labels.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => onChange(i)}
          className={`grow basis-[30%] rounded-lg border px-2 py-2 text-center text-xs font-medium leading-tight transition-colors ${
            value === i
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-brand-200 text-ink/60 hover:border-brand-400 active:border-brand-400 hover:bg-brand-50 active:bg-brand-50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  backLabel,
  nextLabel,
}: {
  onBack: () => void;
  onNext: () => void;
  backLabel: string;
  nextLabel: string;
}) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-ink/60 hover:text-ink/80 active:text-ink/80"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        {backLabel}
      </button>
      <Button onClick={onNext}>
        {nextLabel}
        <ArrowRight className="h-4 w-4" strokeWidth={2} />
      </Button>
    </div>
  );
}
