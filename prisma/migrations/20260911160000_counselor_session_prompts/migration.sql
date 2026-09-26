-- Lets a counselor customize their own "Session prompts" cards on the
-- Toolkit page (see therapist-toolkit.ts's SESSION_PROMPTS). Null keeps
-- showing the built-in defaults.

ALTER TABLE "Counselor" ADD COLUMN "sessionPromptCards" JSONB;
