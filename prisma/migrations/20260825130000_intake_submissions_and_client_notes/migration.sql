-- Persists intake-form submissions and adds per-client session notes, both
-- scoped to the assigned counselor, so a client's full profile (intake +
-- session history + next steps) is available in the therapist portal.
-- Reverses the prior "intake answers are never stored" design, at the
-- product owner's explicit request — see IntakeSubmission's comment in
-- schema.prisma.

CREATE TABLE IF NOT EXISTS "IntakeSubmission" (
    "id" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "aiSummary" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntakeSubmission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ClientNote" (
    "id" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "sessionDate" DATE NOT NULL DEFAULT CURRENT_DATE,
    "notes" TEXT NOT NULL,
    "nextSteps" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientNote_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE INDEX "IntakeSubmission_counselorId_clientEmail_idx" ON "IntakeSubmission"("counselorId", "clientEmail");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX "ClientNote_counselorId_clientEmail_idx" ON "ClientNote"("counselorId", "clientEmail");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "IntakeSubmission" ADD CONSTRAINT "IntakeSubmission_counselorId_fkey"
    FOREIGN KEY ("counselorId") REFERENCES "Counselor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ClientNote" ADD CONSTRAINT "ClientNote_counselorId_fkey"
    FOREIGN KEY ("counselorId") REFERENCES "Counselor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
