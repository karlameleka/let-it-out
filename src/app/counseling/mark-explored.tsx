"use client";

import { useEffect, useRef } from "react";
import { markOnboardingCounselingStepDone } from "@/lib/onboarding";

/**
 * Fires once per page view to mark the onboarding "explore counseling"
 * step done. The server action itself is a no-op once already done (see
 * onboarding.ts), so calling it unconditionally on every visit is cheap
 * and avoids an extra read just to check first. Renders nothing.
 */
export default function MarkCounselingExplored() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    markOnboardingCounselingStepDone().catch(() => {
      // Best-effort — a missed write here just leaves the checklist item
      // unchecked until their next visit.
    });
  }, []);

  return null;
}
