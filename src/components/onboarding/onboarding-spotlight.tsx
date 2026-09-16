"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { ONBOARDING_STEPS } from "@/lib/onboarding-steps";
import { useOnboardingTour } from "@/lib/onboarding-tour-context";
import { Button } from "@/components/ui";

const TOOLTIP_COPY: Record<
  string,
  { titleKey: keyof Dictionary["onboarding"]; bodyKey: keyof Dictionary["onboarding"] }
> = {
  reminders: { titleKey: "tooltipRemindersTitle", bodyKey: "tooltipRemindersBody" },
  journal: { titleKey: "tooltipJournalTitle", bodyKey: "tooltipJournalBody" },
  counseling: { titleKey: "tooltipCounselingTitle", bodyKey: "tooltipCounselingBody" },
};

type Placement = { top: number; left: number; width: number; height: number; above: boolean };

const MAX_WAIT_ATTEMPTS = 30; // ~4.5s at 150ms per attempt, covers a route change + data fetch

/**
 * Lightweight guided tooltip: a spotlight ring around whichever element
 * carries the current active step's `data-onboarding` attribute, plus a
 * small text bubble. Activated by OnboardingChecklist (see
 * onboarding-tour-context.tsx), not shown on its own. Purely visual — the
 * dimmed backdrop has pointer-events disabled, so the highlighted element
 * (and everything else on the page) stays fully clickable underneath it.
 */
export default function OnboardingSpotlight({ dict }: { dict: Dictionary["onboarding"] }) {
  const { activeStep, clearActiveStep } = useOnboardingTour();
  const pathname = usePathname();
  const [placement, setPlacement] = useState<Placement | null>(null);

  useEffect(() => {
    if (!activeStep) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlacement(null);
      return;
    }

    const meta = ONBOARDING_STEPS.find((s) => s.id === activeStep);
    if (!meta) {
      clearActiveStep();
      return;
    }

    let attempts = 0;
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    function measure() {
      const el = document.querySelector<HTMLElement>(meta!.selector);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const above = rect.bottom + 140 > window.innerHeight && rect.top > 140;
      setPlacement({ top: rect.top, left: rect.left, width: rect.width, height: rect.height, above });
      return true;
    }

    function tick() {
      if (cancelled) return;
      if (measure()) {
        if (intervalId) clearInterval(intervalId);
        return;
      }
      attempts += 1;
      if (attempts >= MAX_WAIT_ATTEMPTS) {
        if (intervalId) clearInterval(intervalId);
        clearActiveStep();
      }
    }

    intervalId = setInterval(tick, 150);
    tick();

    function onViewportChange() {
      measure();
    }
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
    // Re-run whenever the step changes OR the route changes, since the
    // element only exists on its own page and a checklist click navigates
    // there right before this effect's target step is set.
  }, [activeStep, pathname, clearActiveStep]);

  if (!activeStep || !placement) return null;

  const copy = TOOLTIP_COPY[activeStep];
  const padding = 6;

  return (
    <div className="pointer-events-none fixed inset-0 z-[55]">
      <div
        className="absolute rounded-xl ring-2 ring-brand-500 transition-all duration-200"
        style={{
          top: placement.top - padding,
          left: placement.left - padding,
          width: placement.width + padding * 2,
          height: placement.height + padding * 2,
          boxShadow: "0 0 0 9999px rgba(18,53,67,0.45)",
        }}
      />
      <div
        className="animate-pop-in pointer-events-auto absolute w-64 rounded-2xl border-2 border-brand-100 bg-white p-4 shadow-2xl"
        style={{
          left: Math.min(Math.max(placement.left, 16), window.innerWidth - 272),
          top: placement.above
            ? Math.max(placement.top - padding - 12, 16)
            : placement.top + placement.height + padding + 12,
          transform: placement.above ? "translateY(-100%)" : undefined,
        }}
      >
        <p className="font-display text-sm font-semibold text-brand-900">{dict[copy.titleKey]}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink/65">{dict[copy.bodyKey]}</p>
        <Button type="button" onClick={clearActiveStep} className="mt-3 !px-4 !py-2 text-xs">
          {dict.tooltipGotIt}
        </Button>
      </div>
    </div>
  );
}
