"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { useOnboardingTour } from "@/lib/onboarding-tour-context";
import { Button } from "@/components/ui";

/**
 * Center-screen welcome modal shown exactly once, the first time a page
 * renders with `shouldShow` true. Shared between the logged-in flow
 * (gated on the account's onboardingWelcomeSeenAt column, greeting by
 * name) and the guest flow (gated on a localStorage flag, generic
 * copy) — see onboarding-root.tsx and onboarding-guest-flow.tsx for
 * which one computes `shouldShow` and what `onShown` does.
 */
export default function OnboardingWelcomeModal({
  headline,
  body,
  shouldShow,
  onShown,
  dict,
}: {
  headline: string;
  body: string;
  shouldShow: boolean;
  /** Called once, the moment the modal actually renders — persists
   * "seen" so it never shows again (DB write for accounts, localStorage
   * for guests). */
  onShown: () => void;
  dict: Dictionary["onboarding"];
}) {
  const [open, setOpen] = useState(false);
  const { setChecklistOpen } = useOnboardingTour();
  const shown = useRef(false);

  useEffect(() => {
    if (!shouldShow || shown.current) return;
    shown.current = true;
    setOpen(true);
    onShown();
    // onShown is a fresh closure each render in practice, but it's only
    // ever meant to fire once per mount (guarded by the ref above), so
    // it's deliberately excluded from the dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            {headline}
          </h2>
        </div>
        <div className="px-6 py-6">
          <p className="text-sm leading-relaxed text-ink/70">{body}</p>
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
