-- Referral system: each user gets a random, non-guessable referralCode
-- (unlike accountCode's sequential LIO-0001 style, which would let anyone
-- enumerate other users' referral codes) used to build their shareable
-- invite link/QR code, plus a Referral table recording each successful
-- activation (a friend's PWA install completing) and the single-use
-- 20%-off PromoCode minted for that friend at that moment.

CREATE OR REPLACE FUNCTION generate_referral_code() RETURNS TEXT AS $$
  SELECT upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
$$ LANGUAGE SQL;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;

UPDATE "User" SET "referralCode" = generate_referral_code() WHERE "referralCode" IS NULL;

ALTER TABLE "User" ALTER COLUMN "referralCode" SET DEFAULT generate_referral_code();
ALTER TABLE "User" ALTER COLUMN "referralCode" SET NOT NULL;

DO $$ BEGIN
  CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Named "UserReferral" (not "Referral") — that table name is already
-- taken by the unrelated therapist-to-therapist client-referral feature.
CREATE TABLE "UserReferral" (
  "id" TEXT NOT NULL,
  "referrerId" TEXT NOT NULL,
  "promoCodeId" TEXT NOT NULL,
  "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserReferral_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserReferral_promoCodeId_key" ON "UserReferral"("promoCodeId");
CREATE INDEX "UserReferral_referrerId_idx" ON "UserReferral"("referrerId");

ALTER TABLE "UserReferral" ADD CONSTRAINT "UserReferral_referrerId_fkey"
  FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserReferral" ADD CONSTRAINT "UserReferral_promoCodeId_fkey"
  FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
