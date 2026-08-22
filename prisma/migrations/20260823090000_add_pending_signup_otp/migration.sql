-- Signup now requires OTP verification (to email or phone) before an
-- account is created. PendingSignup holds the not-yet-verified signup
-- data; the real User row is only created once the code is confirmed.
CREATE TYPE "OtpChannel" AS ENUM ('EMAIL', 'PHONE');

CREATE TABLE "PendingSignup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "birthYear" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "referralSource" TEXT NOT NULL,
    "serviceInterests" TEXT[],
    "otpChannel" "OtpChannel" NOT NULL,
    "otpCodeHash" TEXT NOT NULL,
    "otpExpiresAt" TIMESTAMP(3) NOT NULL,
    "otpSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingSignup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PendingSignup_email_key" ON "PendingSignup"("email");
CREATE UNIQUE INDEX "PendingSignup_phone_key" ON "PendingSignup"("phone");
