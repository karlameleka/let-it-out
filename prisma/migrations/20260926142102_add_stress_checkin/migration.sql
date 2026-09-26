-- CreateEnum
CREATE TYPE "StressLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- CreateTable
CREATE TABLE "StressCheckIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "level" "StressLevel" NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StressCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StressCheckInPrompt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unlockDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StressCheckInPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StressCheckIn_userId_completedAt_idx" ON "StressCheckIn"("userId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StressCheckInPrompt_userId_unlockDate_key" ON "StressCheckInPrompt"("userId", "unlockDate");

-- AddForeignKey
ALTER TABLE "StressCheckIn" ADD CONSTRAINT "StressCheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StressCheckInPrompt" ADD CONSTRAINT "StressCheckInPrompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
