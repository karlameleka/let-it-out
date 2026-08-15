import { prisma } from "@/lib/db";

/** Reads whether a user has opted into the journal privacy lock. Called
 * directly from server components (not through the client) so each
 * journal page knows whether to render the lock gate at all. */
export async function getJournalLockEnabled(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { journalLockEnabled: true } });
  return user?.journalLockEnabled ?? false;
}
