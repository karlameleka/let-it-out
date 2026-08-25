-- Meeting link a counselor posts once a session is confirmed — surfaced to
-- the client on /upcoming and emailed to them automatically.
ALTER TABLE "SessionBooking" ADD COLUMN IF NOT EXISTS "meetingLink" TEXT;
ALTER TABLE "BookingRequest" ADD COLUMN IF NOT EXISTS "meetingLink" TEXT;
