-- Replace the ageRange bucket with a birthYear column, and add
-- serviceInterests for the new signup question. Both idempotent.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "birthYear" INTEGER;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "serviceInterests" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "User" DROP COLUMN IF EXISTS "ageRange";
