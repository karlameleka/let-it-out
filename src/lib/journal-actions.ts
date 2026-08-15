"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { getNextPrompt } from "@/lib/prompts";
import { getJournalStats, type JournalStats } from "@/lib/journal-stats";
import { getMoodPatterns, type MoodPatterns } from "@/lib/mood-patterns";

// A client-compressed data URI — capped well above what the composer's
// resize step should ever produce, as a defense-in-depth backstop.
const MAX_PHOTO_LENGTH = 3_000_000;

const entrySchema = z.object({
  content: z.string().trim().min(1, "Write a little something before saving."),
  mood: z.string().trim().optional(),
  promptId: z.string().optional(),
  photoUrl: z.string().max(MAX_PHOTO_LENGTH, "That photo is too large.").optional(),
});

export type EntryFormState = { error?: string; success?: boolean } | undefined;

export async function createJournalEntry(
  _prevState: EntryFormState,
  formData: FormData,
): Promise<EntryFormState> {
  const user = await requireUser().catch(() => null);
  if (!user) return { error: "Please log in to save journal entries." };

  const parsed = entrySchema.safeParse({
    content: formData.get("content"),
    mood: formData.get("mood") || undefined,
    promptId: formData.get("promptId") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.journalEntry.create({
    data: {
      userId: user.userId,
      content: parsed.data.content,
      mood: parsed.data.mood,
      promptId: parsed.data.promptId,
      photoUrl: parsed.data.photoUrl,
    },
  });

  revalidatePath("/journal");

  return { success: true };
}

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

/** How many recent entries the feed loads at once — generous for a
 * personal journal without paginating. */
const FEED_ENTRY_LIMIT = 200;

export type JournalFeedEntry = {
  id: string;
  content: string;
  mood: string | null;
  bookmarked: boolean;
  photoUrl: string | null;
  createdAt: string;
};

export type JournalFeedData = {
  entries: JournalFeedEntry[];
  stats: JournalStats;
};

/** Everything the journal feed needs, fetched only after the privacy lock
 * is passed — nothing here is embedded in the page's initial HTML. */
export async function getJournalFeedData(): Promise<JournalFeedData | null> {
  const user = await requireUser().catch(() => null);
  if (!user) return null;

  const [entries, stats] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      take: FEED_ENTRY_LIMIT,
      select: { id: true, content: true, mood: true, bookmarked: true, photoUrl: true, createdAt: true },
    }),
    getJournalStats(user.userId),
  ]);

  return {
    entries: entries.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
    stats,
  };
}

export type JournalEntryDetail = {
  id: string;
  content: string;
  mood: string | null;
  bookmarked: boolean;
  photoUrl: string | null;
  createdAt: string;
  prompt: { category: string; text: string } | null;
};

export async function getJournalEntryDetail(id: string): Promise<JournalEntryDetail | null> {
  const user = await requireUser().catch(() => null);
  if (!user) return null;

  const entry = await prisma.journalEntry.findUnique({
    where: { id },
    include: { prompt: { select: { category: true, text: true } } },
  });
  if (!entry || entry.userId !== user.userId) return null;

  return {
    id: entry.id,
    content: entry.content,
    mood: entry.mood,
    bookmarked: entry.bookmarked,
    photoUrl: entry.photoUrl,
    createdAt: entry.createdAt.toISOString(),
    prompt: entry.prompt,
  };
}

export async function getMoodPatternsData(): Promise<MoodPatterns | null> {
  const user = await requireUser().catch(() => null);
  if (!user) return null;
  return getMoodPatterns(user.userId);
}

export async function toggleBookmark(entryId: string): Promise<{ success: boolean; bookmarked?: boolean }> {
  const user = await requireUser().catch(() => null);
  if (!user) return { success: false };

  const entry = await prisma.journalEntry.findUnique({ where: { id: entryId }, select: { userId: true, bookmarked: true } });
  if (!entry || entry.userId !== user.userId) return { success: false };

  const updated = await prisma.journalEntry.update({
    where: { id: entryId },
    data: { bookmarked: !entry.bookmarked },
    select: { bookmarked: true },
  });

  revalidatePath("/journal");
  revalidatePath(`/journal/${entryId}`);

  return { success: true, bookmarked: updated.bookmarked };
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
