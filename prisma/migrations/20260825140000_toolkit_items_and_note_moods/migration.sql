-- Per-therapist customizable toolbox (add/remove links + uploaded PDFs)
-- and mood tracking on session notes (same mood vocabulary as the journal
-- app's mood picker).

CREATE TYPE "ToolkitItemKind" AS ENUM ('LINK', 'PDF');

ALTER TABLE "Counselor" ADD COLUMN IF NOT EXISTS "hiddenDefaultTools" TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE "ClientNote" ADD COLUMN IF NOT EXISTS "moods" TEXT[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS "ToolkitItem" (
    "id" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "kind" "ToolkitItemKind" NOT NULL,
    "url" TEXT,
    "fileData" TEXT,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolkitItem_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE INDEX "ToolkitItem_counselorId_idx" ON "ToolkitItem"("counselorId");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ToolkitItem" ADD CONSTRAINT "ToolkitItem_counselorId_fkey"
    FOREIGN KEY ("counselorId") REFERENCES "Counselor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
