-- AlterTable
ALTER TABLE "Counselor" ADD COLUMN "priceEGP" INTEGER;

-- CreateEnum
CREATE TYPE "SessionBookingStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED');

-- CreateTable
CREATE TABLE "SessionBooking" (
    "id" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "preferredDate" TEXT NOT NULL,
    "priceEGP" INTEGER NOT NULL,
    "status" "SessionBookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentRef" TEXT,
    "paymentNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionBooking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SessionBooking" ADD CONSTRAINT "SessionBooking_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "Counselor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
