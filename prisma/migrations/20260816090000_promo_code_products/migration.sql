CREATE TABLE IF NOT EXISTS "PromoCodeProduct" (
  "id" TEXT NOT NULL,
  "promoCodeId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,

  CONSTRAINT "PromoCodeProduct_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PromoCodeProduct_promoCodeId_productId_key"
  ON "PromoCodeProduct"("promoCodeId", "productId");

DO $$ BEGIN
  ALTER TABLE "PromoCodeProduct" ADD CONSTRAINT "PromoCodeProduct_promoCodeId_fkey"
    FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "PromoCodeProduct" ADD CONSTRAINT "PromoCodeProduct_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
