"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { markOnboardingWelcomeSeen } from "@/lib/onboarding";
import { useOnboardingTour } from "@/lib/onboarding-tour-context";
import { Button } from "@/components/ui";

/**
 * Center-screen welcome modal shown exactly once per account, the first
 * time a page renders for a logged-in user whose onboardingWelcomeSeenAt
 * is still null server-side. `shouldShow` reflects that server read, so a
 * returning user (or one who already saw it earlier this session, thanks
 * to the persisted DB column) never gets it again — see
 * markOnboardingWelcomeSeen() in src/lib/onboarding.ts.
 */
export default function OnboardingWelcomeModal({
  firstName,
  shouldShow,
  dict,
}: {
  firstName: string;
  shouldShow: boolean;
  dict: Dictionary["onboarding"];
}) {
  const [open, setOpen] = useState(false);
  const { setChecklistOpen } = useOnboardingTour();
  const markedSeen = useRef(false);

  useEffect(() => {
    if (!shouldShow || markedSeen.current) return;
    markedSeen.current = true;
    setOpen(true);
    markOnboardingWelcomeSeen().catch(() => {
      // Best-effort — worst case this shows again next login, which is
      // harmless, unlike blocking the modal on a network round trip.
    });
  }, [shouldShow]);

  if (!open) return null;

  function close() {
    setOpen(false);
  }

  function startTour() {
    setOpen(false);
    setChecklistOpen(true);
  }

  return (
    <div
      className="fixed inset-0 z-[65] flex items-end justify-center bg-ink/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-welcome-heading"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md animate-pop-in overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-2xl"
      >
        <div className="bg-brand-700 px-6 py-6 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <Sparkles className="h-5 w-5" strokeWidth={2} />
          </span>
          <h2 id="onboarding-welcome-heading" className="mt-3 font-display text-xl font-semibold">
            {dict.welcomeHeadline.replace("{name}", firstName)}
          </h2>
        </div>
        <div className="px-6 py-6">
          <p className="text-sm leading-relaxed text-ink/70">{dict.welcomeBody}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={startTour}>
              {dict.startTour}
            </Button>
            <Button type="button" variant="outline" onClick={close}>
              {dict.skip}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
