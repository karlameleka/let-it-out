-- Data fix: priceEGP is only ever set by hand against the local dev
-- database (or here), never against production directly — see
-- 20260815092000_counselor_languages_and_seed_data for the same pattern.
UPDATE "Counselor"
SET "priceEGP" = 1000
WHERE "slug" = 'hana-khaled';
