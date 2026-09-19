-- Data fix: new counselors are only ever added by hand against the local
-- dev database via prisma/seed.ts, which never runs against production
-- (only `prisma migrate deploy` does) — bundling this insert into a
-- migration guarantees it applies everywhere. ON CONFLICT guards against
-- a local dev database that already has this row from running the seed.
INSERT INTO "Counselor" (id, slug, name, credentials, bio, specialties, languages, "photoUrl", active, "sortOrder", email)
VALUES (
  gen_random_uuid()::text,
  'ahmed-shehab',
  'Ahmed Shehab',
  'Psychiatrist',
  'Dr. Ahmed Shehab is a psychiatrist with a broad clinical practice spanning general and adult psychiatry, child and adolescent psychiatry, addiction psychiatry, and consultation-liaison psychiatry. In general and adult psychiatry, he works with depression, anxiety, bipolar disorder, schizophrenia, suicide prevention, personality disorders, stress-related disorders, PTSD, burnout, and family counseling. In child and adolescent psychiatry, he supports young clients and their families with ADHD, ASD, ODD, learning and intellectual disabilities, personality and conduct concerns, and parenting skills. His addiction psychiatry practice covers substance use disorders, gambling and gaming addiction, and dual-diagnosis presentations, alongside sleep psychiatry for insomnia and parasomnias. His psychotherapy practice draws on CBT, ACT, DBT, and parenting and family therapy.',
  ARRAY['General & Adult Psychiatry', 'Child & Adolescent Psychiatry', 'Addiction Psychiatry', 'CBT', 'DBT'],
  ARRAY['Arabic', 'English'],
  '/counselors/ahmed-shehab.jpg',
  true,
  4,
  'A.shehabmo@gmail.com'
)
ON CONFLICT (slug) DO NOTHING;
