"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

const entrySchema = z.object({
  content: z.string().trim().min(1, "Write a little something before saving."),
  mood: z.string().trim().optional(),
  promptId: z.string().optional(),
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
    },
  });

  revalidatePath("/journal");
  revalidatePath("/journal/history");

  return { success: true };
}
