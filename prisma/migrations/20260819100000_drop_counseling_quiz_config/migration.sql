-- The "not sure who to pick" modal quiz is replaced by a live keyword
-- search bar (static in-app keyword dictionary, no DB-backed config), so
-- its structural admin config table is no longer needed.
DROP TABLE IF EXISTS "CounselingQuizConfig";
DROP TYPE IF EXISTS "QuizPlacement";
