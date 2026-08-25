-- Cal.com has been fully retired; counselors now use in-app availability
-- windows (CounselorAvailability) for scheduling instead of a per-counselor
-- Cal.com link. Drop the column outright rather than just stopping the app
-- from reading it, so any leftover (test) links are cleared everywhere,
-- including already-deployed production data.
ALTER TABLE "Counselor" DROP COLUMN IF EXISTS "bookingUrl";
