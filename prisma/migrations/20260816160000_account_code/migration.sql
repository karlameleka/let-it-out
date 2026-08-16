CREATE SEQUENCE IF NOT EXISTS "user_account_code_seq";

CREATE OR REPLACE FUNCTION generate_account_code() RETURNS TEXT AS $$
  SELECT 'LIO-' || lpad(nextval('user_account_code_seq')::text, 4, '0');
$$ LANGUAGE SQL;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accountCode" TEXT;

UPDATE "User" SET "accountCode" = generate_account_code() WHERE "accountCode" IS NULL;

ALTER TABLE "User" ALTER COLUMN "accountCode" SET DEFAULT generate_account_code();
ALTER TABLE "User" ALTER COLUMN "accountCode" SET NOT NULL;

DO $$ BEGIN
  CREATE UNIQUE INDEX "User_accountCode_key" ON "User"("accountCode");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;
