-- Ebooks are no longer sold anywhere in the app (removed to satisfy Apple
-- App Store Guideline 3.1.1: digital goods sold inside an iOS app must go
-- through Apple's In-App Purchase, not an external processor — rather than
-- add IAP just for this, ebooks were dropped as a purchasable format
-- entirely). The storefront queries already filtered to format = 'PHYSICAL'
-- only, so this just cleans up the underlying data to match: any ebook
-- variant never actually ordered is removed outright, and any product left
-- with nothing but ebook variants (so it has no physical alternative) is
-- deactivated rather than left listed with nothing purchasable. A variant
-- that WAS ordered is left alone — OrderItem.formatSnapshot is historical
-- order record-keeping and must never be altered or deleted retroactively.
--
-- The ProductFormat enum itself (and its EBOOK value) is intentionally left
-- in the schema: Postgres has no way to drop an enum value without
-- recreating the type, which fails outright if any row still references it
-- (a real risk here, since production's actual history can't be inspected
-- from this migration). Leaving it defined but unused is harmless — nothing
-- in the app creates or sells an EBOOK-format variant anymore.
DELETE FROM "ProductVariant"
WHERE format = 'EBOOK'
  AND id NOT IN (SELECT DISTINCT "productVariantId" FROM "OrderItem");

UPDATE "Product" SET active = false
WHERE active = true
  AND id IN (
    SELECT "productId" FROM "ProductVariant" GROUP BY "productId" HAVING bool_and(format = 'EBOOK')
  );
