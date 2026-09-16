"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CheckCircle2, Circle, ListChecks, X } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { OnboardingStepId } from "@/lib/onboarding";
import { dismissOnboardingChecklist } from "@/lib/onboarding";
import { ONBOARDING_STEPS } from "@/lib/onboarding-steps";
import { useOnboardingTour } from "@/lib/onboarding-tour-context";
import { hapticTap } from "@/lib/haptics";

type StepItem = { id: OnboardingStepId; label: string; done: boolean };

/**
 * Persistent, dismissible "get started" widget — a floating pill (bottom
 * corner, opposite HelpButton) that expands into a 3-item checklist.
 * Clicking a step navigates to where it's done and arms that step's
 * guided tooltip (see OnboardingSpotlight); the "reminders" step's
 * checkmark comes from a real push subscription existing, not a stored
 * flag, so it's correct even for someone who enabled reminders before
 * ever seeing this widget.
 */
export default function OnboardingChecklist({
  steps,
  dismissed,
  dict,
}: {
  steps: StepItem[];
  dismissed: boolean;
  dict: Dictionary["onboarding"];
}) {
  const [hidden, setHidden] = useState(dismissed);
  const router = useRouter();
  const pathname = usePathname();
  const { checklistOpen, setChecklistOpen, startStep } = useOnboardingTour();

  if (hidden) return null;
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/therapist") || pathname?.startsWith("/support")) {
    return null;
  }

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  function handleStepClick(step: StepItem) {
    hapticTap();
    const meta = ONBOARDING_STEPS.find((s) => s.id === step.id);
    if (!meta) return;
    startStep(step.id);
    router.push(meta.href);
  }

  function dismiss() {
    hapticTap();
    setHidden(true);
    dismissOnboardingChecklist().catch(() => {
      // Best-effort — worst case this reappears next load, which is
      // harmless and recoverable by dismissing again.
    });
  }

  return (
    <div className="fixed bottom-24 start-5 z-40 md:bottom-5">
      {checklistOpen && (
        <div className="animate-pop-in absolute bottom-[calc(100%+0.75rem)] start-0 w-72 rounded-2xl border-2 border-brand-100 bg-white p-5 shadow-xl">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-display font-semibold text-brand-900">{dict.checklistTitle}</p>
              <p className="mt-0.5 text-xs text-ink/50">
                {allDone
                  ? dict.checklistAllDone
                  : dict.checklistProgress.replace("{done}", String(doneCount)).replace("{total}", String(steps.length))}
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label={dict.checklistDismiss}
              className="shrink-0 text-ink/30 transition-colors hover:text-ink/60"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <ul className="mt-4 space-y-1">
            {steps.map((step) => (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => handleStepClick(step)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-brand-50 active:bg-brand-50"
                >
                  {step.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={2} />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-brand-200" strokeWidth={2} />
                  )}
                  <span className={`text-sm ${step.done ? "text-ink/40 line-through" : "font-medium text-ink/80"}`}>
                    {step.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          hapticTap();
          setChecklistOpen(!checklistOpen);
        }}
        className="flex items-center gap-2 rounded-full border-2 border-brand-100 bg-white py-2.5 pe-4 ps-3 text-sm font-semibold text-brand-700 shadow-lg transition-colors hover:border-brand-300"
      >
        <ListChecks className="h-5 w-5" strokeWidth={2} />
        {dict.checklistTitle}
        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">
          {doneCount}/{steps.length}
        </span>
      </button>
    </div>
  );
}
