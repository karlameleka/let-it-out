import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";

export type CounselingQuizOption = { label: string; specialty: string };

export type CounselingQuizConfigData = {
  triggerLabel: string;
  prompt: string;
  options: CounselingQuizOption[];
  languagePrompt: string;
  languageAnyLabel: string;
  placement: "ABOVE_LIST" | "BELOW_LIST";
};

export const getCounselingQuizConfig = cache(async (): Promise<CounselingQuizConfigData> => {
  const row = await prisma.counselingQuizConfig.findUnique({ where: { id: "singleton" } });
  if (!row) {
    return {
      triggerLabel: "Not sure who to pick?",
      prompt: "What are you looking for?",
      options: [],
      languagePrompt: "Which language would you prefer to speak in?",
      languageAnyLabel: "No preference",
      placement: "ABOVE_LIST",
    };
  }
  return {
    triggerLabel: row.triggerLabel,
    prompt: row.prompt,
    options: row.options as CounselingQuizOption[],
    languagePrompt: row.languagePrompt,
    languageAnyLabel: row.languageAnyLabel,
    placement: row.placement,
  };
});

export async function updateCounselingQuizConfig(formData: FormData) {
  "use server";
  await requireAdmin();

  const triggerLabel = String(formData.get("triggerLabel") ?? "").trim();
  const prompt = String(formData.get("prompt") ?? "").trim();
  const languagePrompt = String(formData.get("languagePrompt") ?? "").trim();
  const languageAnyLabel = String(formData.get("languageAnyLabel") ?? "").trim();
  const placement = formData.get("placement") === "BELOW_LIST" ? "BELOW_LIST" : "ABOVE_LIST";
  const options = JSON.parse(String(formData.get("optionsJson") ?? "[]")) as CounselingQuizOption[];

  await prisma.counselingQuizConfig.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", triggerLabel, prompt, options, languagePrompt, languageAnyLabel, placement },
    update: { triggerLabel, prompt, options, languagePrompt, languageAnyLabel, placement },
  });

  revalidatePath("/counseling");
  revalidatePath("/admin/counseling-quiz");
}
