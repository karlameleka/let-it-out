"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { OnboardingStepId } from "@/lib/onboarding";

type OnboardingTourContextValue = {
  /** Which step's guided tooltip should look for its anchor on the current
   * page, or null when no tooltip is active. Set by the checklist when a
   * step is clicked, cleared once the tooltip is dismissed. */
  activeStep: OnboardingStepId | null;
  /** Whether the checklist panel is expanded (vs. collapsed to a pill). */
  checklistOpen: boolean;
  setChecklistOpen: (open: boolean) => void;
  /** Called by a checklist item: activates that step's tooltip for the next
   * page the anchor appears on, and collapses the checklist out of the way. */
  startStep: (step: OnboardingStepId) => void;
  /** Called once the tooltip has been shown and dismissed (or its anchor
   * never appeared), so it doesn't linger across further navigation. */
  clearActiveStep: () => void;
};

const OnboardingTourContext = createContext<OnboardingTourContextValue | null>(null);

export function OnboardingTourProvider({ children }: { children: React.ReactNode }) {
  const [activeStep, setActiveStep] = useState<OnboardingStepId | null>(null);
  const [checklistOpen, setChecklistOpen] = useState(false);

  const value = useMemo<OnboardingTourContextValue>(
    () => ({
      activeStep,
      checklistOpen,
      setChecklistOpen,
      startStep: (step) => {
        setActiveStep(step);
        setChecklistOpen(false);
      },
      clearActiveStep: () => setActiveStep(null),
    }),
    [activeStep, checklistOpen],
  );

  return <OnboardingTourContext.Provider value={value}>{children}</OnboardingTourContext.Provider>;
}

export function useOnboardingTour() {
  const ctx = useContext(OnboardingTourContext);
  if (!ctx) throw new Error("useOnboardingTour must be used within OnboardingTourProvider");
  return ctx;
}
