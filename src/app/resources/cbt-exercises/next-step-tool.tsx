"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Info, RotateCcw, Sparkles } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui";
import { recordCbtCompletion } from "@/lib/cbt-streak";

const STORAGE_KEY = "lio_next_step_count";

const WHEN_OPTIONS = ["Right after this", "Later today", "Tomorrow"];

type Step = 0 | 1 | 2 | 3;

export default function NextStepTool() {
  const [step, setStep] = useState<Step>(0);
  const [stuckOn, setStuckOn] = useState("");
  const [tinyStep, setTinyStep] = useState("");
  const [when, setWhen] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCount(Number(window.localStorage.getItem(STORAGE_KEY) ?? "0"));
  }, []);

  function finish() {
    const next = (count ?? 0) + 1;
    setCount(next);
    window.localStorage.setItem(STORAGE_KEY, String(next));
    recordCbtCompletion();
    setStep(3);
  }

  function startOver() {
    setStep(0);
    setStuckOn("");
    setTinyStep("");
    setWhen(null);
  }

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-sm">
      {step < 3 && (
        <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50 px-6 py-3 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Step {step + 1} of 3</p>
          {count !== null && count > 0 && (
            <p className="text-xs text-ink/40">
              {count} tiny step{count === 1 ? "" : "s"} so far
            </p>
          )}
        </div>
      )}

      <div className="p-6 sm:p-8">
        {step === 0 && (
          <>
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-brand-50/70 p-4 text-sm text-ink/70">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" strokeWidth={2} />
              <p>
                A behavioral activation technique — when everything feels stuck, momentum often comes from
                action first, motivation second. Pick one thing, shrink it down, and just start. About 1
                minute.
              </p>
            </div>
            <p className="font-display text-lg font-medium text-brand-900">
              What&apos;s one thing that&apos;s been weighing on you, or feels stuck?
            </p>
            <textarea
              rows={3}
              value={stuckOn}
              onChange={(e) => setStuckOn(e.target.value)}
              placeholder="A task, a conversation, a decision..."
              className="mt-4 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
            />
            <Button onClick={() => setStep(1)} disabled={!stuckOn.trim()} className="mt-6">
              Continue
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Button>
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Step 2 · Shrink it</p>
            <p className="mt-2 font-display text-lg font-medium text-brand-900">
              If you could take one tiny, doable step today — 2 minutes or less — what would it be?
            </p>
            <p className="mt-1 text-sm text-ink/60">
              Not the whole thing. Just the smallest possible first move.
            </p>
            <textarea
              rows={3}
              value={tinyStep}
              onChange={(e) => setTinyStep(e.target.value)}
              placeholder="e.g. Open the document. Send one text. Put on my shoes."
              className="mt-4 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
            />
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-ink/60 hover:text-ink/80 active:text-ink/80"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                Back
              </button>
              <Button onClick={() => setStep(2)} disabled={!tinyStep.trim()}>
                Continue
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">Step 3 · Commit</p>
            <p className="mt-2 font-display text-lg font-medium text-brand-900">When will you do it?</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {WHEN_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setWhen(option)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    when === option
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-brand-200 text-ink/70 hover:border-brand-400 active:border-brand-400 hover:bg-brand-50 active:bg-brand-50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-ink/60 hover:text-ink/80 active:text-ink/80"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                Back
              </button>
              <Button onClick={finish} disabled={!when}>
                Finish
                <Check className="h-4 w-4" strokeWidth={2} />
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="animate-pop-in">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white">
              <Sparkles className="h-5 w-5" strokeWidth={2} />
            </span>
            <p className="mt-3 font-display text-lg font-semibold text-brand-900">That&apos;s the move.</p>
            <p className="mt-1 text-sm text-ink/60">
              {count !== null && count > 0 && `${count} tiny step${count === 1 ? "" : "s"} so far. `}
              Here&apos;s what you committed to:
            </p>

            <div className="mt-4 space-y-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-5 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">The tiny step</p>
                <p className="mt-1 font-medium text-brand-800">&ldquo;{tinyStep}&rdquo;</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">When</p>
                <p className="mt-1 text-ink/80">{when}</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-ink/40">
              This isn&apos;t saved anywhere — it&apos;s just for you, right now.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button onClick={startOver}>
                <RotateCcw className="h-4 w-4" strokeWidth={2} />
                Do another
              </Button>
              <ButtonLink href="/counseling" variant="text">
                If this feels heavy, talk it through with a counselor &rarr;
              </ButtonLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
