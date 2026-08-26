"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Info, RotateCcw, Sparkles } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui";
import { recordCbtCompletion } from "@/lib/cbt-streak";
import { saveCbtEntry } from "@/lib/cbt-history";
import type { Dictionary } from "@/lib/i18n/dictionary";

const STORAGE_KEY = "lio_grounding_count";

export default function GroundingTool({ dict }: { dict: Dictionary["groundingTool"] }) {
  const SENSES = [
    { count: 5, label: "see", prompt: dict.senseSee },
    { count: 4, label: "feel", prompt: dict.senseFeel },
    { count: 3, label: "hear", prompt: dict.senseHear },
    { count: 2, label: "smell", prompt: dict.senseSmell },
    { count: 1, label: "taste", prompt: dict.senseTaste },
  ];
  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState<string[]>(SENSES.map(() => ""));
  const [count, setCount] = useState<number | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const done = step >= SENSES.length;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCount(Number(window.localStorage.getItem(STORAGE_KEY) ?? "0"));
  }, []);

  function updateNote(value: string) {
    setNotes((prev) => prev.map((n, i) => (i === step ? value : n)));
  }

  function finish() {
    const next = (count ?? 0) + 1;
    setCount(next);
    window.localStorage.setItem(STORAGE_KEY, String(next));
    setStreak(recordCbtCompletion().streak);
    saveCbtEntry({
      type: "grounding",
      summary: notes.find((n) => n.trim()) ?? "5-4-3-2-1 grounding session",
      data: Object.fromEntries(SENSES.map((s, i) => [s.label, notes[i]])),
    });
    setStep(SENSES.length);
  }

  function startOver() {
    setStep(0);
    setNotes(SENSES.map(() => ""));
  }

  const current = SENSES[step];

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-sm">
      {!done && (
        <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50 px-6 py-3 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            {dict.stepOf.replace("{current}", String(step + 1)).replace("{total}", String(SENSES.length))}
          </p>
          {count !== null && count > 0 && (
            <p className="text-xs text-ink/40">
              {(count === 1 ? dict.sessionSoFar : dict.sessionsSoFar).replace("{n}", String(count))}
            </p>
          )}
        </div>
      )}

      <div className="p-6 sm:p-8">
        {step === 0 && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-brand-50/70 p-4 text-sm text-ink/70">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" strokeWidth={2} />
            <p>{dict.infoText}</p>
          </div>
        )}

        {!done && current && (
          <>
            <p className="font-display text-lg font-medium text-brand-900">{current.prompt}</p>
            <textarea
              rows={3}
              value={notes[step]}
              onChange={(e) => updateNote(e.target.value)}
              placeholder={dict.notePlaceholder}
              className="mt-4 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
            />
            <div className="mt-6 flex items-center gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-ink/60 hover:text-ink/80 active:text-ink/80"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                  {dict.back}
                </button>
              )}
              <Button onClick={() => (step === SENSES.length - 1 ? finish() : setStep((s) => s + 1))}>
                {step === SENSES.length - 1 ? dict.finish : dict.next}
                {step === SENSES.length - 1 ? (
                  <Check className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                )}
              </Button>
            </div>
          </>
        )}

        {done && (
          <div className="animate-pop-in">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white">
              <Sparkles className="h-5 w-5" strokeWidth={2} />
            </span>
            <p className="mt-3 font-display text-lg font-semibold text-brand-900">{dict.doneTitle}</p>
            <p className="mt-1 text-sm text-ink/60">
              {streak !== null && streak > 1 && dict.streakLine.replace("{n}", String(streak))}
              {count !== null &&
                count > 0 &&
                (count === 1 ? dict.sessionSoFar : dict.sessionsSoFar).replace("{n}", String(count)) + " "}
              {dict.noticePresent}
            </p>

            <p className="mt-4 text-xs text-ink/40">{dict.savedPrivately}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button onClick={startOver}>
                <RotateCcw className="h-4 w-4" strokeWidth={2} />
                {dict.doItAgain}
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
