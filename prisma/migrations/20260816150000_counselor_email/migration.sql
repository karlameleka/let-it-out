ALTER TABLE "Counselor" ADD COLUMN IF NOT EXISTS "email" TEXT;

UPDATE "Counselor" SET "email" = 'Vernabenjamen@gmail.com' WHERE "slug" = 'verna-awad';
UPDATE "Counselor" SET "email" = 'karlameleka@gmail.com' WHERE "slug" = 'karla-meleka';
