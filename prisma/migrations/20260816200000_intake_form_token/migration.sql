-- Tracks emailed intake-form links. Deliberately does NOT store the
-- form answers themselves — only enough to validate the link and know
-- where to route the eventual submission.

CREATE TABLE IF NOT EXISTS "IntakeFormToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "counselorName" TEXT NOT NULL,
    "counselorEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "IntakeFormToken_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE UNIQUE INDEX "IntakeFormToken_tokenHash_key" ON "IntakeFormToken"("tokenHash");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;
