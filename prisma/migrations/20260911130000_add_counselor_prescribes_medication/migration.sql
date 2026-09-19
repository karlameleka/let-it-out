-- AlterTable
ALTER TABLE "Counselor" ADD COLUMN "prescribesMedication" BOOLEAN NOT NULL DEFAULT false;

-- Data fix: this is a factual, admin-set flag rather than something
-- derived from free-text credentials — Dr. Ahmed Shehab is a psychiatrist
-- and can prescribe. Bundled into the migration (not just seed.ts) so it
-- applies against production too — see CLAUDE.md's data-vs-seed note.
UPDATE "Counselor" SET "prescribesMedication" = true WHERE "slug" = 'ahmed-shehab';
