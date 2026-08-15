-- Inventory tracking on ProductVariant (null = untracked/unlimited)
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "stockCount" INTEGER;

-- Promo codes
DO $$ BEGIN
  CREATE TYPE "PromoDiscountType" AS ENUM ('PERCENT', 'FIXED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "PromoCode" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "discountType" "PromoDiscountType" NOT NULL,
  "discountValue" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "expiresAt" TIMESTAMP(3),
  "maxRedemptions" INTEGER,
  "redemptionCount" INTEGER NOT NULL DEFAULT 0,
  "minOrderEGP" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PromoCode_code_key" ON "PromoCode"("code");

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "promoCodeId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "discountEGP" INTEGER NOT NULL DEFAULT 0;

DO $$ BEGIN
  ALTER TABLE "Order" ADD CONSTRAINT "Order_promoCodeId_fkey"
    FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
