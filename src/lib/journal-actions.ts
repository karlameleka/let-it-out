"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getNextPrompt } from "@/lib/prompts";

/** Fetches a fresh, likely-different prompt for the "shuffle" button. */
export async function shufflePrompt(currentPromptId?: string) {
  const user = await requireUser().catch(() => null);
  if (!user) return null;

  let prompt = await getNextPrompt(user.userId);
  if (prompt?.id === currentPromptId) {
    prompt = await getNextPrompt(user.userId);
  }
  return prompt;
}

export type JournalExportEntry = {
  id: string;
  content: string;
  mood: string | null;
  bookmarked: boolean;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  prompt: { category: string; text: string } | null;
};

export type JournalExportData = {
  exportedAt: string;
  entries: JournalExportEntry[];
};

/** Entries written before journal storage moved to the device — read once
 * by the client's local-only migration (see local-journal.ts) to copy them
 * in, then never queried again. Not used for the day-to-day feed/export
 * anymore. */
export async function exportJournalEntries(): Promise<JournalExportData | null> {
  const user = await requireUser().catch(() => null);
  if (!user) return null;

  const entries = await prisma.journalEntry.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
    include: { prompt: { select: { category: true, text: true } } },
  });

  return {
    exportedAt: new Date().toISOString(),
    entries: entries.map((e) => ({
      id: e.id,
      content: e.content,
      mood: e.mood,
      bookmarked: e.bookmarked,
      photoUrl: e.photoUrl,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      prompt: e.prompt,
    })),
  };
}

export async function updateJournalLockSetting(enabled: boolean): Promise<{ success: boolean }> {
  const user = await requireUser().catch(() => null);
  if (!user) return { success: false };

  await prisma.user.update({ where: { id: user.userId }, data: { journalLockEnabled: enabled } });
  return { success: true };
}

export async function verifyJournalLock(password: string): Promise<{ success: boolean; error?: string }> {
  const session = await requireUser().catch(() => null);
  if (!session) return { success: false, error: "Please log in again." };
  if (!password) return { success: false, error: "Enter your password." };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { success: false, error: "Account not found." };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { success: false, error: "Incorrect password." };

  return { success: true };
}
