import type { OnboardingStepId } from "@/lib/onboarding";

export type OnboardingStepMeta = {
  id: OnboardingStepId;
  /** Where clicking the checklist item navigates to before the tooltip
   * looks for its anchor. */
  href: string;
  /** CSS selector for the element the guided tooltip highlights, matched
   * via a `data-onboarding` attribute on the real page element rather than
   * an id, so it can't collide with anything else on the page. */
  selector: string;
};

export const ONBOARDING_STEPS: OnboardingStepMeta[] = [
  { id: "reminders", href: "/account", selector: '[data-onboarding="reminders-toggle"]' },
  { id: "journal", href: "/journal", selector: '[data-onboarding="journal-new-entry"]' },
  { id: "counseling", href: "/counseling", selector: '[data-onboarding="counseling-list"]' },
];
