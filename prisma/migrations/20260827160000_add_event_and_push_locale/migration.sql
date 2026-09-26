-- Optional Arabic translations for admin-posted events, same nullable
-- fallback pattern as Article/Product/Counselor/JournalPrompt.
ALTER TABLE "Event" ADD COLUMN "titleAr" TEXT;
ALTER TABLE "Event" ADD COLUMN "descriptionAr" TEXT;

-- Per-subscription site locale, captured at subscribe time and kept in
-- sync on language switches, so a broadcast push can pick the right
-- language per recipient at send time.
ALTER TABLE "PushSubscription" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en';
