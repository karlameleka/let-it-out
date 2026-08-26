-- Reverting the previous migration: Vercel's Hobby plan only allows a cron
-- job to run once a day, so the hourly-poll-plus-admin-configured-hour
-- scheme this column pair supported isn't viable — both notification crons
-- are back to a single fixed daily run (see vercel.json).
ALTER TABLE "SiteSettings" DROP COLUMN "journalReminderHour";
ALTER TABLE "SiteSettings" DROP COLUMN "sessionReminderHour";
