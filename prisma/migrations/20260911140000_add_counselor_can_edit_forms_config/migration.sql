-- AlterTable
ALTER TABLE "Counselor" ADD COLUMN "canEditFormsConfig" BOOLEAN NOT NULL DEFAULT false;

-- Data fix: an admin-granted permission, not something inferable from
-- other columns — Karla Meleka and Verna Awad (lead psychotherapist) get
-- it now per request. Bundled into the migration (not just seed.ts) so it
-- applies against production too — see CLAUDE.md's data-vs-seed note.
UPDATE "Counselor" SET "canEditFormsConfig" = true WHERE "slug" IN ('verna-awad', 'karla-meleka');
