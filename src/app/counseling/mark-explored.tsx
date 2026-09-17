"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { markOnboardingCounselingStepDone } from "@/lib/onboarding";

/**
 * Fires once per page view to mark the onboarding "explore counseling"
 * step done. The server action itself is a no-op once already done (see
 * onboarding.ts), so calling it unconditionally on every visit is cheap
 * and avoids an extra read just to check first. Renders nothing.
 */
export default function MarkCounselingExplored() {
  const fired = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    markOnboardingCounselingStepDone()
      .then((justCompleted) => {
        // The onboarding checklist reads this from the root layout, which
        // a plain page view won't re-fetch on its own — without this it
        // keeps showing unchecked until some unrelated navigation happens
        // to force a refresh. Only worth it the one time this step
        // actually flips, not every repeat visit afterward.
        if (justCompleted) router.refresh();
      })
      .catch(() => {
        // Best-effort — a missed write here just leaves the checklist item
        // unchecked until their next visit.
      });
  }, [router]);

  return null;
}
