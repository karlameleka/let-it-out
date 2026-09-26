import type { StressLevel } from "@/generated/prisma/enums";

// The Perceived Stress Scale (PSS-10) — Cohen, Kamarck & Mermelstein
// (1983) — a widely used, freely available 10-item self-report measure of
// how unpredictable, uncontrollable, and overloaded people find their
// lives over the past month. Not a diagnostic tool: it's a screening/
// self-awareness instrument, same disclaimer as every other assessment in
// this app.
export type Pss10Question = {
  id: string;
  text: string;
  textAr: string;
  // Items 4, 5, 7, 8 in the standard PSS-10 are positively worded and
  // scored in reverse (a high "I felt confident" answer means LOW stress).
  reverseScored: boolean;
};

export const PSS10_QUESTIONS: Pss10Question[] = [
  {
    id: "q1",
    text: "In the last month, how often have you been upset because of something that happened unexpectedly?",
    textAr: "في الشهر اللي فات، قد إيه حسيت بانزعاج بسبب حاجة حصلت من غير ما تتوقعها؟",
    reverseScored: false,
  },
  {
    id: "q2",
    text: "In the last month, how often have you felt that you were unable to control the important things in your life?",
    textAr: "في الشهر اللي فات، قد إيه حسيت إنك مش قادر تتحكم في الحاجات المهمة في حياتك؟",
    reverseScored: false,
  },
  {
    id: "q3",
    text: "In the last month, how often have you felt nervous and stressed?",
    textAr: "في الشهر اللي فات، قد إيه حسيت بالعصبية والتوتر؟",
    reverseScored: false,
  },
  {
    id: "q4",
    text: "In the last month, how often have you felt confident about your ability to handle your personal problems?",
    textAr: "في الشهر اللي فات، قد إيه حسيت بالثقة إنك قادر تتعامل مع مشاكلك الشخصية؟",
    reverseScored: true,
  },
  {
    id: "q5",
    text: "In the last month, how often have you felt that things were going your way?",
    textAr: "في الشهر اللي فات، قد إيه حسيت إن الأمور ماشية لصالحك؟",
    reverseScored: true,
  },
  {
    id: "q6",
    text: "In the last month, how often have you found that you could not cope with all the things that you had to do?",
    textAr: "في الشهر اللي فات، قد إيه حسيت إنك مش قادر تتصرف في كل حاجة كان لازم تعملها؟",
    reverseScored: false,
  },
  {
    id: "q7",
    text: "In the last month, how often have you been able to control irritations in your life?",
    textAr: "في الشهر اللي فات، قد إيه قدرت تتحكم في اللي بيضايقك في حياتك؟",
    reverseScored: true,
  },
  {
    id: "q8",
    text: "In the last month, how often have you felt that you were on top of things?",
    textAr: "في الشهر اللي فات، قد إيه حسيت إنك متحكم في الأمور ومسيطر عليها؟",
    reverseScored: true,
  },
  {
    id: "q9",
    text: "In the last month, how often have you been angered because of things that happened that were outside of your control?",
    textAr: "في الشهر اللي فات، قد إيه اتغضبت بسبب حاجات حصلت وكانت برا سيطرتك؟",
    reverseScored: false,
  },
  {
    id: "q10",
    text: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?",
    textAr: "في الشهر اللي فات، قد إيه حسيت إن الصعوبات بقت متراكمة أوي لدرجة إنك مش قادر تتخطاها؟",
    reverseScored: false,
  },
];

export const PSS10_ANSWER_SCALE: { value: number; label: string; labelAr: string }[] = [
  { value: 0, label: "Never", labelAr: "أبدًا" },
  { value: 1, label: "Almost never", labelAr: "نادرًا" },
  { value: 2, label: "Sometimes", labelAr: "أحيانًا" },
  { value: 3, label: "Fairly often", labelAr: "كتير" },
  { value: 4, label: "Very often", labelAr: "كتير أوي" },
];

// Commonly used banding for the PSS-10's 0-40 range (the original 1983
// paper itself doesn't define cut points — these are the ranges most
// widely cited in derivative screening tools): 0-13 low, 14-26 moderate,
// 27-40 high.
export function scorePss10(answers: Record<string, number>): { score: number; level: StressLevel } {
  let score = 0;
  for (const q of PSS10_QUESTIONS) {
    const raw = answers[q.id];
    const clamped = Math.min(4, Math.max(0, Math.round(raw)));
    score += q.reverseScored ? 4 - clamped : clamped;
  }
  const level: StressLevel = score <= 13 ? "LOW" : score <= 26 ? "MODERATE" : "HIGH";
  return { score, level };
}
