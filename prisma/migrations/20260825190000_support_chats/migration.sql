-- Client "Having technical issues? Live Chat" conversations, answered by
-- an AI assistant scoped to app/technical problems only. Escalated chats
-- (the bot couldn't resolve it) trigger a one-time admin notification
-- email and show up in /admin/support for the site owner to follow up.

CREATE TYPE "SupportChatStatus" AS ENUM ('OPEN', 'RESOLVED', 'ESCALATED');

CREATE TABLE IF NOT EXISTS "SupportChat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "status" "SupportChatStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "escalatedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "SupportChat_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE INDEX "SupportChat_userId_idx" ON "SupportChat"("userId");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  CREATE INDEX "SupportChat_status_idx" ON "SupportChat"("status");
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "SupportChat" ADD CONSTRAINT "SupportChat_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
