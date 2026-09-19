-- ReflectionPrompt was the one user-owned table left on ON DELETE RESTRICT
-- (every other one — JournalEntry, PushSubscription, SupportChat,
-- WebAuthnCredential, EventRSVP, NotificationRead, PageView, UserReferral —
-- already cascades). RESTRICT meant deleting an account with any reflection
-- sheet history threw a foreign key violation instead of completing —
-- deleteUserAccountCompletely now also explicitly clears these rows itself,
-- but this brings the constraint in line with the rest of the schema too.
ALTER TABLE "ReflectionPrompt" DROP CONSTRAINT "ReflectionPrompt_userId_fkey";
ALTER TABLE "ReflectionPrompt" ADD CONSTRAINT "ReflectionPrompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
