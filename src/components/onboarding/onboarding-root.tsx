"use client";

import type { Dictionary } from "@/lib/i18n/dictionary";
import type { OnboardingState } from "@/lib/onboarding";
import { markOnboardingWelcomeSeen } from "@/lib/onboarding";
import { OnboardingTourProvider } from "@/lib/onboarding-tour-context";
import OnboardingCarousel from "./onboarding-carousel";
import OnboardingSpotlight from "./onboarding-spotlight";
import OnboardingGuestFlow from "./onboarding-guest-flow";

/**
 * Single mount point for the whole onboarding system, rendered sitewide
 * from layout.tsx regardless of login state — see that file for the
 * ADMIN-role exclusion. A visitor gets exactly one of the two flows
 * below: a brand-new account sees the full-screen welcome carousel
 * (OnboardingCarousel) exactly once; everyone signed out sees the guest
 * (pre-signup) welcome modal + checklist, which still drives the guided
 * tooltip spotlight shared below — the carousel is fully self-contained
 * and doesn't use it.
 */
export default function OnboardingRoot({
  loggedIn,
  firstName,
  accountState,
  dict,
  installDict,
}: {
  loggedIn: boolean;
  firstName: string;
  accountState: OnboardingState | null;
  dict: Dictionary["onboarding"];
  installDict: Dictionary["install"];
}) {
  return (
    <OnboardingTourProvider>
      {loggedIn && accountState ? (
        <OnboardingCarousel
          firstName={firstName}
          shouldShow={!accountState.welcomeSeen}
          onShown={() => {
            markOnboardingWelcomeSeen().catch(() => {
              // Best-effort — worst case this shows again next login,
              // which is harmless, unlike blocking it on a network round
              // trip.
            });
          }}
          dict={dict}
          installDict={installDict}
        />
      ) : (
        <OnboardingGuestFlow dict={dict} />
      )}
      <OnboardingSpotlight dict={dict} />
    </OnboardingTourProvider>
  );
}
