-- Admin-configurable send hour (0-23, Egypt local time) for the two push
-- notification crons. Defaults match the hours the fixed Vercel Cron
-- schedules were already running at (18:00 UTC / 17:00 UTC = 20:00 / 19:00
-- Egypt time), so this is a no-op for existing deployments until an admin
-- changes it.
ALTER TABLE "SiteSettings" ADD COLUMN "journalReminderHour" INTEGER NOT NULL DEFAULT 20;
ALTER TABLE "SiteSettings" ADD COLUMN "sessionReminderHour" INTEGER NOT NULL DEFAULT 19;
