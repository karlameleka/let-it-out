-- Data fix: new counselors are only ever added by hand against the local
-- dev database via prisma/seed.ts, which never runs against production
-- (only `prisma migrate deploy` does) — bundling this insert into a
-- migration guarantees it applies everywhere. ON CONFLICT guards against
-- a local dev database that already has this row from running the seed.
INSERT INTO "Counselor" (id, slug, name, credentials, bio, specialties, languages, "photoUrl", active, "sortOrder")
VALUES (
  gen_random_uuid()::text,
  'hana-khaled',
  'Hana Khaled',
  'Clinical Psychologist & Assistant Lecturer, MSc Clinical Psychology (British University in Egypt)',
  'Hana Khaled Aman is a Clinical Psychologist and Assistant Lecturer with a Master of Science in Clinical Psychology from the British University in Egypt in collaboration with London South Bank University. She has received certified training in Cognitive Behavioral Therapy for depression, social anxiety, post-traumatic stress disorder (PTSD), obsessive-compulsive disorder (OCD), personality disorders, as well as ethical practice in therapy. Hana has trained and worked in several clinical settings, including Abou El Azayem Psychiatric Hospital, the Drug and Addiction Fund, and a university counseling center. Hana has five years of teaching experience at the BUE. She has worked extensively with children, adolescents, and young adults, supporting them with a range of concerns including anxiety, depression, health anxiety, insomnia and sleep disorders, and eating disorders. In her practice, she focuses on drawing from diverse therapeutic modalities to develop personalized treatment plans and interventions that are aligned with each client''s presentation and goals.',
  ARRAY['Anxiety', 'Depression', 'CBT', 'Sleep & Insomnia', 'Eating Disorders'],
  ARRAY['Arabic', 'English'],
  '/counselors/hana-khaled.jpg',
  true,
  3
)
ON CONFLICT (slug) DO NOTHING;
