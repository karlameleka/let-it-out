-- Real time slot for the pay-first counseling flow, set only when picked
-- from the in-app slot picker (counselors with CounselorAvailability
-- windows configured) rather than the pre-payment-Cal.com-picker fallback.

ALTER TABLE "SessionBooking" ADD COLUMN IF NOT EXISTS "preferredTime" TEXT;
