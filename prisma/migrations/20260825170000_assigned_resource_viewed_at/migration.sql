-- Tracks when a client first opens Resources > "My tools" after a
-- therapist sends them a new item, to drive the unread-count badge on the
-- Resources tab and the installed-app icon. Null = unread.

ALTER TABLE "AssignedResource" ADD COLUMN IF NOT EXISTS "viewedAt" TIMESTAMP(3);
