-- Replaces the blunt SiteSettings.resourcesPromoPlacement (TOP/BOTTOM) and
-- resourcesPromoHidden (journal card only) toggles with a proper ordered,
-- per-section hide/reorder system covering every /resources section
-- (journal/CBT/breathing/assessments promo cards + the article list),
-- managed from /admin/resources. Each promo card's editable text lives in
-- the existing SiteText override table, not here.

CREATE TYPE "ResourceBlockKind" AS ENUM ('JOURNAL_PROMO', 'CBT_PROMO', 'BREATHING_PROMO', 'ASSESSMENTS_PROMO', 'ARTICLES');

CREATE TABLE "ResourceBlock" (
    "kind"      "ResourceBlockKind" NOT NULL,
    "hidden"    BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ResourceBlock_pkey" PRIMARY KEY ("kind")
);

-- Seed the 5 fixed rows, carrying forward the old placement/hidden values
-- from SiteSettings where a row already exists, so nothing visibly changes
-- for existing deployments the moment this ships.
INSERT INTO "ResourceBlock" ("kind", "hidden", "sortOrder") VALUES
  ('JOURNAL_PROMO', false, 0),
  ('CBT_PROMO', false, 1),
  ('BREATHING_PROMO', false, 2),
  ('ASSESSMENTS_PROMO', false, 3),
  ('ARTICLES', false, 4);

UPDATE "ResourceBlock" SET "hidden" = true
WHERE "kind" = 'JOURNAL_PROMO' AND EXISTS (
  SELECT 1 FROM "SiteSettings" WHERE "id" = 'singleton' AND "resourcesPromoHidden" = true
);

UPDATE "ResourceBlock" SET "sortOrder" = -1
WHERE "kind" = 'ARTICLES' AND EXISTS (
  SELECT 1 FROM "SiteSettings" WHERE "id" = 'singleton' AND "resourcesPromoPlacement" = 'BOTTOM'
);

ALTER TABLE "SiteSettings" DROP COLUMN "resourcesPromoPlacement";
ALTER TABLE "SiteSettings" DROP COLUMN "resourcesPromoHidden";
DROP TYPE "ResourcesPromoPlacement";
