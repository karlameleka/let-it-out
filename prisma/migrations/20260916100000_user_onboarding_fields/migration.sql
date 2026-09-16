-- AlterTable
ALTER TABLE "User" ADD COLUMN "onboardingWelcomeSeenAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "onboardingChecklistDismissedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "onboardingJournalDoneAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "onboardingCounselingDoneAt" TIMESTAMP(3);

-- Grandfather in every account that already existed before this feature
-- shipped, so only genuinely new signups ever see the welcome modal.
UPDATE "User" SET "onboardingWelcomeSeenAt" = now() WHERE "onboardingWelcomeSeenAt" IS NULL;
