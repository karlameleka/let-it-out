-- CreateTable
CREATE TABLE "WorkshopInterestSignup" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkshopInterestSignup_pkey" PRIMARY KEY ("id")
);
