import { prisma } from "@/lib/db";

const PROMPT_COUNT = 30;

export async function getTodayPrompt() {
  const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);
  const dayNumber = (daysSinceEpoch % PROMPT_COUNT) + 1;
  return prisma.journalPrompt.findUnique({ where: { dayNumber } });
}
