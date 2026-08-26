import type { Metadata } from "next";
import Link from "next/link";
import { Brain, Compass, Footprints } from "lucide-react";
import { Container } from "@/components/ui";
import { Ribbon, DoodleField } from "@/components/decor";
import CbtStreakStats from "./cbt-streak-stats";
import CbtHistoryList from "./cbt-history-list";
import CbtThinkingPatterns from "./cbt-thinking-patterns";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "CBT Exercises",
  description: "Short, evidence-based CBT techniques — cognitive reframing, grounding, and behavioral activation.",
};

export default async function CbtExercisesPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).cbtExercises;

  const EXERCISES = [
    {
      href: "/resources/cognitive-reframing",
      icon: Brain,
      duration: t.exercise1Duration,
      title: t.exercise1Title,
      description: t.exercise1Description,
    },
    {
      href: "/resources/cbt-exercises/grounding",
      icon: Compass,
      duration: t.exercise2Duration,
      title: t.exercise2Title,
      description: t.exercise2Description,
    },
    {
      href: "/resources/cbt-exercises/next-step",
      icon: Footprints,
      duration: t.exercise3Duration,
      title: t.exercise3Title,
      description: t.exercise3Description,
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-brand-50 pt-6 pb-10 sm:pt-14 sm:pb-20">
        <DoodleField />
        <Container className="relative max-w-2xl">
          <Ribbon>{t.ribbon}</Ribbon>
          <h1 className="mt-4 font-display text-3xl font-medium leading-[1.1] text-brand-900 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-4 text-lg text-ink/70">{t.description}</p>
          <div className="mt-6">
            <CbtStreakStats dict={t} />
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

          <CbtThinkingPatterns dict={t} />
          <CbtHistoryList dict={t} />
        </Container>
      </section>
    </>
  );
}
