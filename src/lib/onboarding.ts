"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export type OnboardingStepId = "reminders" | "journal" | "counseling";

export type OnboardingState = {
  welcomeSeen: boolean;
  checklistDismissed: boolean;
  steps: Record<OnboardingStepId, boolean>;
};

/** Reads the logged-in user's onboarding progress for the welcome modal and
 * setup checklist. Takes userId directly (not requireUser()) since every
 * caller already has a resolved session from getCurrentUser(). The
 * "reminders" step has no column of its own — it's true whenever the
 * account already has an active push subscription, which also means a
 * user who enabled reminders before this feature existed starts with that
 * step already checked off, correctly. */
export async function getOnboardingState(userId: string): Promise<OnboardingState> {
  const [user, hasPushSubscription] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        onboardingWelcomeSeenAt: true,
        onboardingChecklistDismissedAt: true,
        onboardingJournalDoneAt: true,
        onboardingCounselingDoneAt: true,
      },
    }),
    prisma.pushSubscription.count({ where: { userId } }).then((n) => n > 0),
  ]);

  return {
    welcomeSeen: Boolean(user?.onboardingWelcomeSeenAt),
    checklistDismissed: Boolean(user?.onboardingChecklistDismissedAt),
    steps: {
      reminders: hasPushSubscription,
      journal: Boolean(user?.onboardingJournalDoneAt),
      counseling: Boolean(user?.onboardingCounselingDoneAt),
    },
  };
}

/** Marks the welcome modal as shown — called once, right when it renders
 * client-side, so it never appears again for this account. `updateMany`
 * with a `null` guard (rather than a plain `update`) makes this a no-op
 * on every call after the first, so it's safe to fire without checking
 * state first. */
export async function markOnboardingWelcomeSeen(): Promise<void> {
  const user = await requireUser().catch(() => null);
  if (!user) return;
  await prisma.user.updateMany({
    where: { id: user.userId, onboardingWelcomeSeenAt: null },
    data: { onboardingWelcomeSeenAt: new Date() },
  });
}

/** Hides the setup checklist widget for good. There's deliberately no way
 * back short of a support request, matching how dismissible onboarding
 * checklists work elsewhere. */
export async function dismissOnboardingChecklist(): Promise<void> {
  const user = await requireUser().catch(() => null);
  if (!user) return;
  await prisma.user.updateMany({
    where: { id: user.userId, onboardingChecklistDismissedAt: null },
    data: { onboardingChecklistDismissedAt: new Date() },
  });
}

/** Marks the "write your first journal entry" step done. Journal entries
 * never reach the server at all (see local-journal.ts), so this is called
 * directly from createEntry() the moment one is saved rather than derived
 * from a query. */
export async function markOnboardingJournalStepDone(): Promise<void> {
  const user = await requireUser().catch(() => null);
  if (!user) return;
  await prisma.user.updateMany({
    where: { id: user.userId, onboardingJournalDoneAt: null },
    data: { onboardingJournalDoneAt: new Date() },
  });
}

/** Marks the "explore counseling" step done, fired once from the
 * counseling page itself. */
export async function markOnboardingCounselingStepDone(): Promise<void> {
  const user = await requireUser().catch(() => null);
  if (!user) return;
  await prisma.user.updateMany({
    where: { id: user.userId, onboardingCounselingDoneAt: null },
    data: { onboardingCounselingDoneAt: new Date() },
  });
}
