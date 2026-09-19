-- AlterTable
ALTER TABLE "User" ADD COLUMN     "consentDataProcessingAt" TIMESTAMP(3),
ADD COLUMN     "consentTelehealthAt" TIMESTAMP(3),
ADD COLUMN     "consentTermsOfCareAt" TIMESTAMP(3);
