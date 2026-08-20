-- The Resources page's promo card now advertises the journaling app
-- instead of the CBT cognitive-reframing tool, so the fields controlling
-- its placement/visibility are renamed to reflect that generically.
ALTER TABLE "SiteSettings" RENAME COLUMN "cbtExercisePlacement" TO "resourcesPromoPlacement";
ALTER TABLE "SiteSettings" RENAME COLUMN "cbtExerciseHidden" TO "resourcesPromoHidden";
ALTER TYPE "CbtExercisePlacement" RENAME TO "ResourcesPromoPlacement";
