import type { Metadata } from "next";
import Link from "next/link";
import { Brain, Compass, Footprints } from "lucide-react";
import { Container } from "@/components/ui";
import { Ribbon, DoodleField } from "@/components/decor";
import CbtStreakStats from "./cbt-streak-stats";
import CbtHistoryList from "./cbt-history-list";
import CbtThinkingPatterns from "./cbt-thinking-patterns";

export const metadata: Metadata = {
  title: "CBT Exercises",
  description: "Short, evidence-based CBT techniques — cognitive reframing, grounding, and behavioral activation.",
};

const EXERCISES = [
  {
    href: "/resources/cognitive-reframing",
    icon: Brain,
    duration: "3–5 min",
    title: "Cognitive Reframing",
    description: "Catch an automatic thought, weigh the evidence, and land on something more balanced.",
  },
  {
    href: "/resources/cbt-exercises/grounding",
    icon: Compass,
    duration: "~2 min",
    title: "5-4-3-2-1 Grounding",
    description: "A sensory check-in that pulls your attention back into the present when your mind is racing.",
  },
  {
    href: "/resources/cbt-exercises/next-step",
    icon: Footprints,
    duration: "~1 min",
    title: "Tiny Next Step",
    description: "Feeling stuck? Shrink whatever's weighing on you down to one small, doable action.",
  },
];

export default function CbtExercisesPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-brand-50 pt-6 pb-10 sm:pt-14 sm:pb-20">
        <DoodleField />
        <Container className="relative max-w-2xl">
          <Ribbon>CBT toolkit</Ribbon>
          <h1 className="mt-4 font-display text-3xl font-medium leading-[1.1] text-brand-900 sm:text-4xl">
            Quick techniques, backed by research.
          </h1>
          <p className="mt-4 text-lg text-ink/70">
            Short, evidence-based exercises drawn from cognitive behavioral therapy — pick whichever fits how
            you&apos;re feeling right now. Your answers stay private, saved only on this device.
          </p>
          <div className="mt-6">
            <CbtStreakStats />
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-2xl">
          <div className="grid gap-5">
            {EXERCISES.map((exercise) => (
              <Link
                key={exercise.href}
                href={exercise.href}
                className="group flex items-start gap-4 rounded-2xl border-[1.5px] border-brand-900 bg-white p-6 transition-colors duration-300 hover:bg-brand-900 active:bg-brand-900"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition-colors duration-300 group-hover:bg-white/15 group-hover:text-white group-active:bg-white/15 group-active:text-white">
                  <exercise.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-500 transition-colors duration-300 group-hover:text-white/70 group-active:text-white/70">
                    {exercise.duration}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-brand-900 transition-colors duration-300 group-hover:text-white group-active:text-white">
                    {exercise.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink/60 transition-colors duration-300 group-hover:text-white/70 group-active:text-white/70">
                    {exercise.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <CbtThinkingPatterns />
          <CbtHistoryList />
        </Container>
      </section>
    </>
  );
}
