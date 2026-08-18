-- Promo codes can now be scoped to specific counselors (therapists), not
-- just shop products, and applied to a paid session booking's price.

CREATE TABLE "PromoCodeCounselor" (
    "id"          TEXT NOT NULL,
    "promoCodeId" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,

    CONSTRAINT "PromoCodeCounselor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PromoCodeCounselor_promoCodeId_counselorId_key" ON "PromoCodeCounselor"("promoCodeId", "counselorId");

ALTER TABLE "PromoCodeCounselor" ADD CONSTRAINT "PromoCodeCounselor_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PromoCodeCounselor" ADD CONSTRAINT "PromoCodeCounselor_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "Counselor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SessionBooking"
  ADD COLUMN "promoCodeId" TEXT,
  ADD COLUMN "discountEGP" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "SessionBooking" ADD CONSTRAINT "SessionBooking_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- The "not sure who to pick?" quiz moves from hardcoded dictionary strings
-- to a fully admin-editable structural config (questions, choices, and
-- trigger placement), editable at /admin/counseling-quiz.

CREATE TYPE "QuizPlacement" AS ENUM ('ABOVE_LIST', 'BELOW_LIST');

CREATE TABLE "CounselingQuizConfig" (
    "id"               TEXT NOT NULL DEFAULT 'singleton',
    "triggerLabel"     TEXT NOT NULL,
    "prompt"           TEXT NOT NULL,
    "options"          JSONB NOT NULL,
    "languagePrompt"   TEXT NOT NULL,
    "languageAnyLabel" TEXT NOT NULL,
    "placement"        "QuizPlacement" NOT NULL DEFAULT 'ABOVE_LIST',
    "updatedAt"        TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CounselingQuizConfig_pkey" PRIMARY KEY ("id")
);

INSERT INTO "CounselingQuizConfig" (id, "triggerLabel", prompt, options, "languagePrompt", "languageAnyLabel", placement, "updatedAt")
VALUES (
  'singleton',
  'Not sure who to pick?',
  'What are you looking for?',
  '[{"label":"Stress or burnout","specialty":"Stress & Burnout"},{"label":"Feeling low or depressed","specialty":"Depression"},{"label":"Anxious or overwhelmed","specialty":"Anxiety"},{"label":"Trouble managing emotions","specialty":"Emotional Dysregulation"},{"label":"Relationship or intimacy concerns","specialty":"Psychosexual Therapy"}]'::jsonb,
  'Which language would you prefer to speak in?',
  'No preference',
  'ABOVE_LIST',
  now()
);
