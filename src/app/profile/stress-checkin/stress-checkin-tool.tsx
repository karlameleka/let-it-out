"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui";
import { PSS10_QUESTIONS, PSS10_ANSWER_SCALE } from "@/lib/pss10";
import { submitStressCheckInAction, type StressCheckInSubmitState } from "@/lib/stress-checkin-actions";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

export default function StressCheckInTool({
  locale,
  dict,
  initialCanCheckIn,
  initialNextAvailableAt,
}: {
  locale: Locale;
  dict: Dictionary["stressCheckIn"];
  initialCanCheckIn: boolean;
  initialNextAvailableAt: string | null;
}) {
  const [state, formAction, pending] = useActionState<StressCheckInSubmitState, FormData>(submitStressCheckInAction, undefined);
  const isAr = locale === "ar";

  // Checked first, and independent of the initial* props below: those
  // reflect this page's server-rendered state at the moment it was
  // requested, which a Server Action's own completion re-renders (see the
  // comment in page.tsx) — but this component itself never unmounts, so
  // once state.success is set here, it keeps winning even after that
  // parent re-render hands down a now-stale (freshly re-locked) prop.
  if (state?.success) {
    const levelLabel =
      state.level === "LOW" ? dict.levelLow : state.level === "MODERATE" ? dict.levelModerate : dict.levelHigh;
    const levelBlurb =
      state.level === "LOW" ? dict.levelLowBlurb : state.level === "MODERATE" ? dict.levelModerateBlurb : dict.levelHighBlurb;

    return (
      <div className="rounded-2xl border-2 border-brand-100 bg-white p-6 text-center sm:p-8">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand-600" strokeWidth={1.5} />
        <h2 className="mt-4 font-display text-xl font-semibold text-brand-900">{dict.resultsTitle}</h2>
        <p className="mt-2 text-sm text-ink/60">{dict.resultsScore.replace("{score}", String(state.score))}</p>
        <p className="mt-4 text-lg font-semibold text-brand-800">{levelLabel}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">{levelBlurb}</p>
        {state.level === "HIGH" && (
          <ButtonLink href="/counseling" variant="primary" className="mt-5">
            {dict.exploreCounseling}
          </ButtonLink>
        )}
        <p className="mt-6 text-xs text-ink/40">{dict.disclaimer}</p>
        <Link href="/profile" className="mt-4 inline-block text-sm font-medium text-brand-600 link-grow">
          {dict.backToProfile}
        </Link>
      </div>
    );
  }

  if (!initialCanCheckIn) {
    const nextAvailableLabel = initialNextAvailableAt
      ? new Intl.DateTimeFormat(isAr ? "ar-EG" : "en-GB", { day: "numeric", month: "long" }).format(new Date(initialNextAvailableAt))
      : "";
    return (
      <div className="rounded-2xl border-2 border-brand-100 bg-white p-6 text-center sm:p-8">
        <LockKeyhole className="mx-auto h-8 w-8 text-brand-300" strokeWidth={1.5} />
        <h2 className="mt-3 font-display text-lg font-semibold text-brand-900">{dict.lockedTitle}</h2>
        <p className="mt-2 text-sm text-ink/60">{dict.lockedBody.replace("{date}", nextAvailableLabel)}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {PSS10_QUESTIONS.map((q, i) => (
        <fieldset key={q.id} className="rounded-2xl border border-brand-100 bg-white p-5">
          <legend className="px-0 text-sm font-medium text-ink/80">
            <span className="mr-1.5 text-ink/30">{i + 1}.</span>
            {isAr ? q.textAr : q.text}
          </legend>
          <div className="mt-3 space-y-1.5">
            {PSS10_ANSWER_SCALE.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-brand-100 px-3.5 py-2 text-sm text-ink/70 transition-colors has-checked:border-brand-600 has-checked:bg-brand-50 has-checked:font-medium has-checked:text-brand-900"
              >
                <input
                  type="radio"
                  name={q.id}
                  value={opt.value}
                  required
                  className="h-4 w-4 border-brand-300 text-brand-600 focus:ring-brand-400"
                />
                {isAr ? opt.labelAr : opt.label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? dict.submitting : dict.submit}
      </Button>
    </form>
  );
}
