-- Per-email-address opt-out of optional notification emails, linked from
-- the footer of every customer-facing email — see the EmailPreference
-- model comment in schema.prisma and src/lib/email-preferences.ts.
CREATE TABLE IF NOT EXISTS "EmailPreference" (
    "email"               TEXT NOT NULL,
    "notificationsOptOut" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt"           TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailPreference_pkey" PRIMARY KEY ("email")
);
