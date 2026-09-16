"use client";

import type { Dictionary } from "@/lib/i18n/dictionary";
import type { OnboardingState } from "@/lib/onboarding";
import { markOnboardingWelcomeSeen, dismissOnboardingChecklist } from "@/lib/onboarding";
import { OnboardingTourProvider } from "@/lib/onboarding-tour-context";
import OnboardingWelcomeModal from "./onboarding-welcome-modal";
import OnboardingChecklist from "./onboarding-checklist";
import OnboardingSpotlight from "./onboarding-spotlight";
import OnboardingGuestFlow from "./onboarding-guest-flow";

/**
 * Single mount point for the whole onboarding system (welcome modal,
 * checklist, guided tooltips), rendered sitewide from layout.tsx
 * regardless of login state — see that file for the ADMIN-role
 * exclusion. A visitor gets exactly one of the two flows below, sharing
 * one tour context and one spotlight renderer so a guest who signs up
 * mid-tour hands off cleanly to the account flow on their next page load.
 */
export default function OnboardingRoot({
  loggedIn,
  firstName,
  accountState,
  dict,
}: {
  loggedIn: boolean;
  firstName: string;
  accountState: OnboardingState | null;
  dict: Dictionary["onboarding"];
}) {
  return (
    <OnboardingTourProvider>
      {loggedIn && accountState ? (
        <>
          <OnboardingWelcomeModal
            headline={dict.welcomeHeadline.replace("{name}", firstName)}
            body={dict.welcomeBody}
            shouldShow={!accountState.welcomeSeen}
            onShown={() => {
              markOnboardingWelcomeSeen().catch(() => {
                // Best-effort — worst case this shows again next login,
                // which is harmless, unlike blocking the modal on a
                // network round trip.
              });
            }}
            dict={dict}
          />
          <OnboardingChecklist
            title={dict.checklistTitle}
            steps={[
              { id: "reminders", label: dict.stepRemindersLabel, done: accountState.steps.reminders },
              { id: "journal", label: dict.stepJournalLabel, done: accountState.steps.journal },
              { id: "counseling", label: dict.stepCounselingLabel, done: accountState.steps.counseling },
            ]}
            dismissed={accountState.checklistDismissed}
            onDismiss={() => {
              dismissOnboardingChecklist().catch(() => {
                // Best-effort — worst case this reappears next load,
                // which is harmless and recoverable by dismissing again.
              });
            }}
            dict={dict}
          />
        </>
      ) : (
        <OnboardingGuestFlow dict={dict} />
      )}
      <OnboardingSpotlight dict={dict} />
    </OnboardingTourProvider>
  );
}
