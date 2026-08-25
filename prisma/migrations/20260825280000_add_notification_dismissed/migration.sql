-- Swipe-to-delete on /upcoming: permanently hides a notification row for
-- that client without touching the underlying session/request/event.
ALTER TABLE "NotificationRead" ADD COLUMN IF NOT EXISTS "dismissed" BOOLEAN NOT NULL DEFAULT false;
