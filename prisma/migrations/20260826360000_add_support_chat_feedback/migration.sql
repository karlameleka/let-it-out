-- Post-resolution feedback loop for the live chat bot: whether the client
-- confirmed the bot's fix actually worked, an optional 1-5 satisfaction
-- rating, and a flag surfaced in the admin dashboard when the client
-- disputes a "resolved" claim.
ALTER TABLE "SupportChat" ADD COLUMN "feedbackResolved" BOOLEAN;
ALTER TABLE "SupportChat" ADD COLUMN "feedbackRating" INTEGER;
ALTER TABLE "SupportChat" ADD COLUMN "flaggedUnresolved" BOOLEAN NOT NULL DEFAULT false;
