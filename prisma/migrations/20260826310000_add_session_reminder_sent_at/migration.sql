-- Tracks whether the day-before push reminder has already been sent for a
-- confirmed counseling session, so the reminders cron never sends twice.
ALTER TABLE "SessionBooking" ADD COLUMN "reminderSentAt" TIMESTAMP(3);
ALTER TABLE "BookingRequest" ADD COLUMN "reminderSentAt" TIMESTAMP(3);
