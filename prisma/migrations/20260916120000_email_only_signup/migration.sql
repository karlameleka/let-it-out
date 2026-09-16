-- Signup is email-only now (SMS/phone OTP removed); drop the columns that
-- only existed to support choosing between email and phone at signup.
-- Any unverified signups mid-flight are simply dropped — they were never
-- real accounts, and the OTP screen tells the visitor to try again.
DELETE FROM "PendingSignup";
ALTER TABLE "PendingSignup" DROP COLUMN "phone";
ALTER TABLE "PendingSignup" DROP COLUMN "otpChannel";
DROP TYPE "OtpChannel";
