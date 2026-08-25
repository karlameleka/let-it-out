-- One-click, single-use, passwordless login link for the therapist portal
-- (admin-triggered, separate from the existing password reset token so a
-- login link never touches or invalidates a therapist's actual password).

ALTER TABLE "Counselor" ADD COLUMN IF NOT EXISTS "loginTokenHash" TEXT;
ALTER TABLE "Counselor" ADD COLUMN IF NOT EXISTS "loginTokenExpiresAt" TIMESTAMP(3);

DO $$ BEGIN
  ALTER TABLE "Counselor" ADD CONSTRAINT "Counselor_loginTokenHash_key" UNIQUE ("loginTokenHash");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
