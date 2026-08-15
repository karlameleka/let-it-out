-- AlterTable
ALTER TABLE "Counselor" ADD COLUMN "languages" TEXT[] NOT NULL DEFAULT '{}';

-- Data fix: priceEGP/photoUrl were only ever set by hand against the local
-- dev database, never against production (seeding isn't part of the build
-- step) — bundling them into a migration guarantees `prisma migrate deploy`
-- (which does run on every production build) applies them everywhere.
UPDATE "Counselor"
SET "priceEGP" = 1000,
    "photoUrl" = '/counselors/verna-awad.jpg',
    "languages" = ARRAY['English', 'Arabic']
WHERE "slug" = 'verna-awad';

UPDATE "Counselor"
SET "priceEGP" = 800,
    "photoUrl" = '/counselors/karla-meleka.jpg',
    "languages" = ARRAY['English', 'Arabic', 'French']
WHERE "slug" = 'karla-meleka';
