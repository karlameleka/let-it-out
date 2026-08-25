-- Therapist self-service portal: lets a Counselor log in with their own
-- credentials instead of going through the admin. Mirrors the auth-security
-- columns already on User (password reset tokens, brute-force lockout).
ALTER TABLE "Counselor"
  ADD COLUMN "passwordHash" TEXT,
  ADD COLUMN "resetTokenHash" TEXT,
  ADD COLUMN "resetTokenExpiresAt" TIMESTAMP(3),
  ADD COLUMN "lastPasswordResetRequestAt" TIMESTAMP(3),
  ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lockedUntil" TIMESTAMP(3),
  ADD COLUMN "lastLoginAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Counselor_resetTokenHash_key" ON "Counselor"("resetTokenHash");
