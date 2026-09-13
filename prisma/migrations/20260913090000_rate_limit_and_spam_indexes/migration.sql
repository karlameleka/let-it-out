-- Response to the September 2026 spam-bot incident: every public,
-- unauthenticated form that writes a row without any rate limiting or index
-- support is now covered. See anti-spam.ts for the rate limiter that writes
-- to RateLimitHit, and the admin CRM/messages/workshop pages for the
-- pagination that now reads these tables page-by-page instead of loading
-- every row at once.

CREATE TABLE "RateLimitHit" (
    "id"        TEXT NOT NULL,
    "key"       TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitHit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RateLimitHit_key_createdAt_idx" ON "RateLimitHit"("key", "createdAt");

CREATE INDEX "Lead_type_createdAt_idx" ON "Lead"("type", "createdAt");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");
CREATE INDEX "WorkshopInterestSignup_createdAt_idx" ON "WorkshopInterestSignup"("createdAt");
CREATE INDEX "ResourceNotifySignup_createdAt_idx" ON "ResourceNotifySignup"("createdAt");
CREATE INDEX "WorkshopInquiry_createdAt_idx" ON "WorkshopInquiry"("createdAt");
CREATE INDEX "BookingRequest_createdAt_idx" ON "BookingRequest"("createdAt");
