-- Reverting the Arabic product translations added in
-- 20260827140000_add_product_arabic_content — both guided journals should
-- show their English name/description regardless of site locale.
UPDATE "Product" SET "titleAr" = NULL, "descriptionAr" = NULL
WHERE "slug" IN ('80-days-of-self-love', '30-days-of-mindfulness');
