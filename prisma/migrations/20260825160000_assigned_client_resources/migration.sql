-- Therapist-to-specific-client resources: a therapist can send a link/tool,
-- PDF, note, or assignment to one client, visible only to that client in
-- their own account (Resources > "My tools"). Matched by clientEmail, same
-- pattern as ClientNote/IntakeSubmission.

CREATE TYPE "AssignedResourceKind" AS ENUM ('LINK', 'PDF', 'TEXT', 'ASSIGNMENT');

CREATE TABLE IF NOT EXISTS "AssignedResource" (
    "id" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "kind" "AssignedResourceKind" NOT NULL,
    "url" TEXT,
    "fileData" TEXT,
    "fileName" TEXT,
    "content" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignedResource_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE INDEX "AssignedResource_counselorId_idx" ON "AssignedResource"("counselorId");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX "AssignedResource_clientEmail_idx" ON "AssignedResource"("clientEmail");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "AssignedResource" ADD CONSTRAINT "AssignedResource_counselorId_fkey"
    FOREIGN KEY ("counselorId") REFERENCES "Counselor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
