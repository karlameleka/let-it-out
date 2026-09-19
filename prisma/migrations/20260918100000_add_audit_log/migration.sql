-- Permanent record of admin mutations, admin login activity, and notable
-- background-job outcomes — feeds both the Audit Logs page (full history)
-- and the Notification Center (a curated feed of the same rows). See the
-- AuditLog model comment in schema.prisma for why actorId uses SetNull
-- instead of this app's usual CASCADE on user-owned tables.
DO $$ BEGIN
    CREATE TYPE "AuditSeverity" AS ENUM ('INFO', 'WARNING', 'SECURITY');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id"         TEXT NOT NULL,
    "actorId"    TEXT,
    "actorEmail" TEXT,
    "action"     TEXT NOT NULL,
    "targetType" TEXT,
    "targetId"   TEXT,
    "summary"    TEXT NOT NULL,
    "metadata"   JSONB,
    "severity"   "AuditSeverity" NOT NULL DEFAULT 'INFO',
    "ip"         TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_actorId_idx" ON "AuditLog"("actorId");
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");

DO $$ BEGIN
    ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
