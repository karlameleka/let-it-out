"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { PSS10_QUESTIONS, scorePss10 } from "@/lib/pss10";
import type { StressLevel } from "@/generated/prisma/enums";

const CHECKIN_INTERVAL_DAYS = 30;
const MSEC_PER_DAY = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MSEC_PER_DAY);
}

export type StressCheckInStatus = {
  canCheckIn: boolean;
  /** ISO timestamp the lock lifts — set only while canCheckIn is false. */
  nextAvailableAt: string | null;
  /** Oldest → newest, always exactly 5 entries (this month + the 4
   * before it) — the most recent check-in completed in that calendar
   * month, or null if none. Matches the reference "one bar per month"
   * presentation. */
  monthly: { year: number; month: number; level: StressLevel | null; score: number | null }[];
};

/** Read-only status for the "My Progress" card on My Profile — whether a
 * new PSS-10 check-in is currently unlocked (30 days since the last one,
 * or always for a client who's never taken it), and the last 5 months of
 * results to draw as bars. Returns null only if not logged in (the
 * profile page itself already redirects in that case; this mirrors that
 * guard rather than throwing). */
export async function getMyStressCheckInStatus(): Promise<StressCheckInStatus | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const [lastCheckIn, history] = await Promise.all([
    prisma.stressCheckIn.findFirst({
      where: { userId: user.userId },
      orderBy: { completedAt: "desc" },
      select: { completedAt: true },
    }),
    prisma.stressCheckIn.findMany({
      where: { userId: user.userId },
      orderBy: { completedAt: "desc" },
      take: 24, // comfortably covers 5 calendar months even with slippage
      select: { score: true, level: true, completedAt: true },
    }),
  ]);

  const now = new Date();
  let canCheckIn = true;
  let nextAvailableAt: string | null = null;
  if (lastCheckIn) {
    const unlocksAt = addDays(lastCheckIn.completedAt, CHECKIN_INTERVAL_DAYS);
    if (unlocksAt > now) {
      canCheckIn = false;
      nextAvailableAt = unlocksAt.toISOString();
    }
  }

  const monthly: StressCheckInStatus["monthly"] = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const entry = history.find((h) => h.completedAt.getFullYear() === year && h.completedAt.getMonth() === month);
    monthly.push({ year, month, level: entry?.level ?? null, score: entry?.score ?? null });
  }

  return { canCheckIn, nextAvailableAt, monthly };
}

export type StressCheckInSubmitState =
  | { error: string; success?: undefined }
  | { error?: undefined; success: true; score: number; level: StressLevel }
  | undefined;

/** Scores and saves a PSS-10 submission — re-checks the 30-day lock
 * server-side (the button that gets here is already disabled/hidden
 * while locked, but a direct POST replay shouldn't be able to bypass
 * it). */
export async function submitStressCheckInAction(
  _prevState: StressCheckInSubmitState,
  formData: FormData,
): Promise<StressCheckInSubmitState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in and try again." };

  const lastCheckIn = await prisma.stressCheckIn.findFirst({
    where: { userId: user.userId },
    orderBy: { completedAt: "desc" },
    select: { completedAt: true },
  });
  if (lastCheckIn && addDays(lastCheckIn.completedAt, CHECKIN_INTERVAL_DAYS) > new Date()) {
    return { error: "Your next check-in isn't available yet." };
  }

  const answers: Record<string, number> = {};
  for (const q of PSS10_QUESTIONS) {
    const raw = formData.get(q.id);
    const num = raw === null ? NaN : Number(raw);
    if (!Number.isInteger(num) || num < 0 || num > 4) {
      return { error: "Please answer every question before submitting." };
    }
    answers[q.id] = num;
  }

  const { score, level } = scorePss10(answers);
  await prisma.stressCheckIn.create({ data: { userId: user.userId, score, level } });

  revalidatePath("/profile");
  return { success: true, score, level };
}
