"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { OnboardingStepId } from "@/lib/onboarding";
import {
  readGuestOnboardingState,
  markGuestWelcomeSeen,
  dismissGuestChecklist,
  markGuestStepDone,
  type GuestOnboardingStepId,
} from "@/lib/onboarding-guest-state";
import OnboardingWelcomeModal from "./onboarding-welcome-modal";
import OnboardingChecklist from "./onboarding-checklist";

/**
 * Welcome modal + checklist for a visitor who hasn't signed up yet, shown
 * before login/signup on every page (not gated to any particular route).
 * Generic copy (no name to greet by) and a checklist geared toward
 * getting oriented and signing up, rather than the account-specific
 * steps in onboarding-root.tsx. All state is device-local (see
 * onboarding-guest-state.ts) since there's no account to persist
 * against — once someone actually signs up, this stops rendering
 * entirely (see layout.tsx) and the account flow takes over.
 */
export default function OnboardingGuestFlow({ dict }: { dict: Dictionary["onboarding"] }) {
  // Read localStorage after mount only, so the server-rendered and first
  // client render both start from "nothing shown yet" and stay identical,
  // avoiding a hydration mismatch.
  const [ready, setReady] = useState(false);
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false);
  const [checklistDismissed, setChecklistDismissed] = useState(false);
  const [done, setDone] = useState<Record<GuestOnboardingStepId, boolean>>({
    signup: false,
    counseling: false,
    shop: false,
  });

  useEffect(() => {
    const state = readGuestOnboardingState();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShouldShowWelcome(!state.welcomeSeen);
    setChecklistDismissed(state.checklistDismissed);
    setDone(state.done);
    setReady(true);
  }, []);

  if (!ready) return null;

  const steps = [
    { id: "signup" as const, label: dict.stepSignupLabel, done: done.signup },
    { id: "counseling" as const, label: dict.stepCounselingLabel, done: done.counseling },
    { id: "shop" as const, label: dict.stepShopLabel, done: done.shop },
  ];

  function handleStepClick(id: OnboardingStepId) {
    if (id !== "signup" && id !== "counseling" && id !== "shop") return;
    setDone(markGuestStepDone(id).done);
  }

  return (
    <>
      <OnboardingWelcomeModal
        headline={dict.guestWelcomeHeadline}
        body={dict.guestWelcomeBody}
        shouldShow={shouldShowWelcome}
        onShown={markGuestWelcomeSeen}
        dict={dict}
      />
      <OnboardingChecklist
        title={dict.guestChecklistTitle}
        steps={steps}
        dismissed={checklistDismissed}
        onDismiss={dismissGuestChecklist}
        onStepClick={handleStepClick}
        dict={dict}
      />
    </>
  );
}
