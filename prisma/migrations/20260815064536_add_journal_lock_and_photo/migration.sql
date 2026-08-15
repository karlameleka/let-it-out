-- AlterTable
ALTER TABLE "User" ADD COLUMN     "journalLockEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "photoUrl" TEXT;
