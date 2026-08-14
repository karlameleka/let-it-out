-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('WORKSHOP_LEAD', 'COUNSELING_INQUIRY', 'JOURNAL_CUSTOMER', 'GENERAL_INQUIRY');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LeadType" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "email" TEXT,
    "phone" TEXT,
    "source" TEXT,
    "sessionType" TEXT,
    "groupSize" INTEGER,
    "orderTotalEGP" INTEGER,
    "paymentMethod" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
