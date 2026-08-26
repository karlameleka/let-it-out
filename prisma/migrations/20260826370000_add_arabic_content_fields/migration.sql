-- Optional Arabic translations for admin-authored content (articles, shop
-- products). Nullable and falls back to the English field whenever empty
-- — nothing breaks in Arabic view until an admin fills these in.
ALTER TABLE "Article" ADD COLUMN "titleAr" TEXT;
ALTER TABLE "Article" ADD COLUMN "excerptAr" TEXT;
ALTER TABLE "Article" ADD COLUMN "sectionsAr" JSONB;
ALTER TABLE "Article" ADD COLUMN "checkInsAr" JSONB;

ALTER TABLE "Product" ADD COLUMN "titleAr" TEXT;
ALTER TABLE "Product" ADD COLUMN "descriptionAr" TEXT;
