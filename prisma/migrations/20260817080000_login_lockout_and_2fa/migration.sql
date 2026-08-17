-- Login brute-force lockout, password-reset request throttling, and
-- optional admin TOTP two-factor authentication.

ALTER TABLE "User"
  ADD COLUMN "lastPasswordResetRequestAt" TIMESTAMP(3),
  ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lockedUntil" TIMESTAMP(3),
  ADD COLUMN "totpSecret" TEXT,
  ADD COLUMN "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "totpBackupCodeHashes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
