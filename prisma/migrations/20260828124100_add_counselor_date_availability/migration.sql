-- Lets a therapist open a one-off availability window for a specific date
-- (today up to a month out), alongside the existing recurring weekly
-- windows. dayOfWeek becomes optional — a row now has either dayOfWeek set
-- (recurring) or date set (one-off), never neither, enforced in
-- therapist-availability-actions.ts.
ALTER TABLE "CounselorAvailability" ALTER COLUMN "dayOfWeek" DROP NOT NULL;
ALTER TABLE "CounselorAvailability" ADD COLUMN "date" TEXT;
