-- Persisted site-language tracking, needed so emails triggered outside the
-- visitor's own request (Paymob webhook, a counselor assigning a resource
-- or posting a meeting link) can still be sent in the right language.
ALTER TABLE "User" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en';
ALTER TABLE "Order" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en';
ALTER TABLE "SessionBooking" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en';
ALTER TABLE "IntakeFormToken" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en';

-- Admin-editable Arabic translation of the intake form's sections, same
-- shape as the English "sections" column. Null means untranslated.
ALTER TABLE "IntakeFormConfig" ADD COLUMN "sectionsAr" JSONB;
