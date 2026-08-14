-- AlterEnum
ALTER TYPE "LeadType" ADD VALUE 'ACCOUNT_SIGNUP';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ageRange" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "referralSource" TEXT;
