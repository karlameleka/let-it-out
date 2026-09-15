-- Replaces the single hardcoded Counselor.prescribesMedication boolean with
-- an admin-manageable list of filter chips (CounselorFilter), so filters
-- shown on /counseling can be added or removed from /admin/counseling-filters
-- without a code change.

CREATE TABLE "CounselorFilter" (
    "id"        TEXT NOT NULL,
    "label"     TEXT NOT NULL,
    "labelAr"   TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CounselorFilter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CounselorFilterAssignment" (
    "id"          TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "filterId"    TEXT NOT NULL,

    CONSTRAINT "CounselorFilterAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CounselorFilterAssignment_counselorId_filterId_key" ON "CounselorFilterAssignment"("counselorId", "filterId");

ALTER TABLE "CounselorFilterAssignment" ADD CONSTRAINT "CounselorFilterAssignment_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "Counselor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CounselorFilterAssignment" ADD CONSTRAINT "CounselorFilterAssignment_filterId_fkey" FOREIGN KEY ("filterId") REFERENCES "CounselorFilter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data migration: carry forward the "Prescribes medication" filter and
-- whichever counselors currently have it set, so the public page's filter
-- behavior doesn't change the moment this ships.
INSERT INTO "CounselorFilter" ("id", "label", "sortOrder")
VALUES ('cf-prescribes-medication', 'Prescribes medication', 0);

INSERT INTO "CounselorFilterAssignment" ("id", "counselorId", "filterId")
SELECT 'cfa-' || "id", "id", 'cf-prescribes-medication'
FROM "Counselor"
WHERE "prescribesMedication" = true;

ALTER TABLE "Counselor" DROP COLUMN "prescribesMedication";
