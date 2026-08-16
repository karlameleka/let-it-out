-- Support "Sign in with Google": passwords become optional, and accounts
-- can be linked to a stable Google account id.

ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "googleId" TEXT;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_googleId_key') THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_googleId_key" UNIQUE ("googleId");
  END IF;
END $$;
