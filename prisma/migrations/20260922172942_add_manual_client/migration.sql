-- CreateTable
CREATE TABLE "ManualClient" (
    "id" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "phone" TEXT,
    "referralSource" TEXT,
    "addedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManualClient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ManualClient_counselorId_idx" ON "ManualClient"("counselorId");

-- CreateIndex
CREATE UNIQUE INDEX "ManualClient_counselorId_clientEmail_key" ON "ManualClient"("counselorId", "clientEmail");

-- AddForeignKey
ALTER TABLE "ManualClient" ADD CONSTRAINT "ManualClient_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "Counselor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
