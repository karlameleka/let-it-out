"use client";

import type { Dictionary } from "@/lib/i18n/dictionary";
import type { OnboardingState } from "@/lib/onboarding";
import { OnboardingTourProvider } from "@/lib/onboarding-tour-context";
import OnboardingWelcomeModal from "./onboarding-welcome-modal";
import OnboardingChecklist from "./onboarding-checklist";
import OnboardingSpotlight from "./onboarding-spotlight";

/** Composes the three onboarding pieces (welcome modal, checklist widget,
 * guided tooltip) under one shared tour context — mounted once, sitewide,
 * only for logged-in users (see layout.tsx). */
export default function OnboardingRoot({
  firstName,
  state,
  dict,
}: {
  firstName: string;
  state: OnboardingState;
  dict: Dictionary["onboarding"];
}) {
  const steps = [
    { id: "reminders" as const, label: dict.stepRemindersLabel, done: state.steps.reminders },
    { id: "journal" as const, label: dict.stepJournalLabel, done: state.steps.journal },
    { id: "counseling" as const, label: dict.stepCounselingLabel, done: state.steps.counseling },
  ];

  return (
    <OnboardingTourProvider>
      <OnboardingWelcomeModal firstName={firstName} shouldShow={!state.welcomeSeen} dict={dict} />
      <OnboardingChecklist steps={steps} dismissed={state.checklistDismissed} dict={dict} />
      <OnboardingSpotlight dict={dict} />
    </OnboardingTourProvider>
  );
}
