import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { Locale } from "@/lib/i18n/locale";

export type ReflectionQuestion = { id: string; text: string };

export const getReflectionSheetConfig = cache(
  async (): Promise<{ questions: ReflectionQuestion[]; questionsAr: ReflectionQuestion[] }> => {
    const row = await prisma.reflectionSheetConfig.findUnique({ where: { id: "singleton" } });
    return {
      questions: (row?.questions as ReflectionQuestion[] | undefined) ?? [],
      questionsAr: (row?.questionsAr as ReflectionQuestion[] | undefined) ?? [],
    };
  },
);

/** Resolves the questions to show for a given locale, falling back to
 * English when no Arabic version has been entered yet. */
export async function getReflectionQuestions(locale: Locale = "en"): Promise<ReflectionQuestion[]> {
  const { questions, questionsAr } = await getReflectionSheetConfig();
  if (locale === "ar" && questionsAr.length > 0) return questionsAr;
  return questions;
}

/** Saves both the English and Arabic question lists as submitted by the
 * admin editor — a flat, ordered array each, fully independent of one
 * another (nothing requires the same count/order), since answers live only
 * on the client's own device and are never parsed against this config. */
export async function updateReflectionSheetQuestions(formData: FormData) {
  "use server";
  await requireAdmin();
  const questions = JSON.parse(String(formData.get("questionsJson") ?? "[]"));
  const questionsAr = JSON.parse(String(formData.get("questionsArJson") ?? "[]"));

  await prisma.reflectionSheetConfig.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", questions, questionsAr },
    update: { questions, questionsAr },
  });

  revalidatePath("/admin/reflection-sheet");
}
