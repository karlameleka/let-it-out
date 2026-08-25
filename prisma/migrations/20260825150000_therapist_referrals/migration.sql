-- Internal therapist-to-therapist referral/collaboration system. Sharing is
-- always an explicit, point-in-time snapshot (intakeSnapshot/notesSnapshot)
-- copied at referral time — never a live cross-counselor read into another
-- therapist's IntakeSubmission/ClientNote rows.

CREATE TYPE "ReferralType" AS ENUM ('FULL_REFERRAL', 'COLLABORATE');
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'ACKNOWLEDGED');

CREATE TABLE IF NOT EXISTS "Referral" (
    "id" TEXT NOT NULL,
    "fromCounselorId" TEXT NOT NULL,
    "toCounselorId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "reason" TEXT NOT NULL,
    "type" "ReferralType" NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "intakeSnapshot" JSONB,
    "notesSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE INDEX "Referral_toCounselorId_idx" ON "Referral"("toCounselorId");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX "Referral_fromCounselorId_idx" ON "Referral"("fromCounselorId");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Referral" ADD CONSTRAINT "Referral_fromCounselorId_fkey"
    FOREIGN KEY ("fromCounselorId") REFERENCES "Counselor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Referral" ADD CONSTRAINT "Referral_toCounselorId_fkey"
    FOREIGN KEY ("toCounselorId") REFERENCES "Counselor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
