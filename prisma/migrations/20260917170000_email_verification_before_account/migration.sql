-- Email verification now happens right after the signup wizard's email
-- page, not at the very end. PendingSignup rows are created earlier, before
-- password/country/referral/interests are known, so those columns are no
-- longer stored here at all (they flow straight from the final wizard
-- submission into the real User row in completeSignup). Any unfinished
-- signups mid-flight are simply dropped — they were never real accounts.
DELETE FROM "PendingSignup";
ALTER TABLE "PendingSignup" DROP COLUMN "passwordHash";
ALTER TABLE "PendingSignup" DROP COLUMN "country";
ALTER TABLE "PendingSignup" DROP COLUMN "referralSource";
ALTER TABLE "PendingSignup" DROP COLUMN "serviceInterests";
ALTER TABLE "PendingSignup" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);
