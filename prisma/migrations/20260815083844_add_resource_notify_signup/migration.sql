-- AlterEnum
ALTER TYPE "LeadType" ADD VALUE 'RESOURCE_NOTIFY';

-- CreateTable
CREATE TABLE "ResourceNotifySignup" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceNotifySignup_pkey" PRIMARY KEY ("id")
);
