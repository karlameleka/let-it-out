-- Online session link an admin can post on an Event at creation — shown
-- only to clients who RSVP "attending".
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "meetingLink" TEXT;
