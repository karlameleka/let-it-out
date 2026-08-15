DO $$ BEGIN
  CREATE TYPE "CbtExercisePlacement" AS ENUM ('TOP', 'BOTTOM');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "SiteSettings" (
  "id" TEXT NOT NULL DEFAULT 'singleton',
  "arabicEnabled" BOOLEAN NOT NULL DEFAULT true,
  "cbtExercisePlacement" "CbtExercisePlacement" NOT NULL DEFAULT 'TOP',
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SiteSettings" ("id", "arabicEnabled", "cbtExercisePlacement", "updatedAt")
VALUES ('singleton', true, 'TOP', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
