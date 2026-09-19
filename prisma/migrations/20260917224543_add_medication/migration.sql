-- AlterTable
ALTER TABLE "ClientNote" ALTER COLUMN "sessionDate" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Counselor" ADD COLUMN     "canPrescribeMedication" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "instructions" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Medication_counselorId_clientEmail_idx" ON "Medication"("counselorId", "clientEmail");

-- CreateIndex
CREATE INDEX "Medication_clientEmail_idx" ON "Medication"("clientEmail");

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "Counselor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
