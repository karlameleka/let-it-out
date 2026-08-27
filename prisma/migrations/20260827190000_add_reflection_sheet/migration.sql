-- "In-between sessions" reflection sheet: an admin-editable set of
-- questions the client fills privately (answers stay local to their own
-- device — see src/lib/local-reflection.ts), and a per-booking record of
-- which sessions have already prompted their client to fill it out.

CREATE TABLE "ReflectionSheetConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "questions" JSONB NOT NULL,
    "questionsAr" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReflectionSheetConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReflectionPrompt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceKind" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReflectionPrompt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReflectionPrompt_sourceKind_sourceId_key" ON "ReflectionPrompt"("sourceKind", "sourceId");

ALTER TABLE "ReflectionPrompt" ADD CONSTRAINT "ReflectionPrompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Starter set of reflection prompts — real production content, not
-- placeholder data, so the feature works before an admin ever visits
-- /admin/reflection-sheet (see CLAUDE.md's note on seed data not reaching
-- production).
INSERT INTO "ReflectionSheetConfig" (id, questions, "questionsAr", "updatedAt")
VALUES (
  'singleton',
  '[{"id":"q1","text":"What''s felt different since your last session?"},{"id":"q2","text":"Is there anything from your last session you''re still thinking about?"},{"id":"q3","text":"What''s one moment this week you''d like to bring up next time?"},{"id":"q4","text":"How would you describe your week overall?"},{"id":"q5","text":"What''s one thing you did for yourself this week?"}]'::jsonb,
  '[{"id":"q1","text":"إيه اللي حسيت إنه اتغيّر من آخر جلسة؟"},{"id":"q2","text":"فيه حاجة من آخر جلسة لسه في بالك؟"},{"id":"q3","text":"إيه أهم لحظة الأسبوع ده حابب تتكلم عنها المرة الجاية؟"},{"id":"q4","text":"لو هتوصف أسبوعك عمومًا، هتقول إيه؟"},{"id":"q5","text":"إيه حاجة عملتها لنفسك الأسبوع ده؟"}]'::jsonb,
  now()
);
