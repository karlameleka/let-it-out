-- Admin-created events (workshops, sessions, etc.) broadcast to every
-- logged-in client via the site header's notification bell.
CREATE TABLE IF NOT EXISTS "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Event_startAt_idx" ON "Event"("startAt");
