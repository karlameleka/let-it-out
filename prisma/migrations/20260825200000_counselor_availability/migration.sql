-- Recurring weekly availability windows a counselor without their own
-- Cal.com link opens up for bookings. The public counselor page slices
-- these into concrete 50-minute slots (see src/lib/availability.ts).

CREATE TABLE IF NOT EXISTS "CounselorAvailability" (
    "id" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "CounselorAvailability_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE INDEX "CounselorAvailability_counselorId_idx" ON "CounselorAvailability"("counselorId");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "CounselorAvailability" ADD CONSTRAINT "CounselorAvailability_counselorId_fkey"
    FOREIGN KEY ("counselorId") REFERENCES "Counselor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
