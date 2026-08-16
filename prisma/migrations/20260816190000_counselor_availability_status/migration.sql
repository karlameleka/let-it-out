-- Lets admins mark a counselor as waitlisted or unavailable, hiding the
-- booking form and showing a badge instead.

DO $$ BEGIN
  CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'WAITLIST', 'UNAVAILABLE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Counselor"
  ADD COLUMN IF NOT EXISTS "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE';
