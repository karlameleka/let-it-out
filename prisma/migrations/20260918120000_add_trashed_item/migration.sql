-- A 24-hour undo buffer for admin deletes — see the TrashedItem model
-- comment in schema.prisma and src/lib/trash.ts. deletedById uses SetNull,
-- same reasoning as AuditLog.actorId.
CREATE TABLE IF NOT EXISTS "TrashedItem" (
    "id"             TEXT NOT NULL,
    "modelName"      TEXT NOT NULL,
    "originalId"     TEXT NOT NULL,
    "summary"        TEXT NOT NULL,
    "data"           JSONB NOT NULL,
    "deletedById"    TEXT,
    "deletedByEmail" TEXT,
    "deletedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrashedItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TrashedItem_deletedAt_idx" ON "TrashedItem"("deletedAt");
CREATE INDEX IF NOT EXISTS "TrashedItem_modelName_originalId_idx" ON "TrashedItem"("modelName", "originalId");

DO $$ BEGIN
    ALTER TABLE "TrashedItem" ADD CONSTRAINT "TrashedItem_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
