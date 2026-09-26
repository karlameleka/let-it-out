-- Tracks when a client first taps their session's meeting link from
-- /upcoming, so that booking can move to /upcoming/past immediately
-- instead of waiting for preferredDate to roll into the past.
ALTER TABLE "SessionBooking" ADD COLUMN "joinedAt" TIMESTAMP(3);
ALTER TABLE "BookingRequest" ADD COLUMN "joinedAt" TIMESTAMP(3);
