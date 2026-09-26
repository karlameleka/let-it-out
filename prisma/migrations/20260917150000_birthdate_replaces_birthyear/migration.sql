-- The signup wizard now mirrors Google's account-creation flow, which
-- collects a full birthday (Month/Day/Year), not just a year. Both User and
-- PendingSignup need to store a real date instead of a bare year.

ALTER TABLE "User" ADD COLUMN "birthDate" DATE;
UPDATE "User" SET "birthDate" = make_date("birthYear", 1, 1) WHERE "birthYear" IS NOT NULL;
ALTER TABLE "User" DROP COLUMN "birthYear";

-- PendingSignup rows are short-lived (10 minute OTP window) and not worth
-- preserving across this change — same approach as the email_only_signup
-- migration before it.
DELETE FROM "PendingSignup";
ALTER TABLE "PendingSignup" DROP COLUMN "birthYear";
ALTER TABLE "PendingSignup" ADD COLUMN "birthDate" DATE NOT NULL;
