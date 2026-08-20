import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { Ribbon, DoodleField } from "@/components/decor";
import BreathingTool from "./breathing-tool";
import BreathingStreakStats from "./breathing-streak-stats";

export const metadata: Metadata = {
  title: "Guided Breathing",
  description: "A guided breathing exercise with box breathing, 4-7-8, and coherent breathing patterns, paced with a visual guide.",
};

export default function BreathingPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-brand-50 pt-6 pb-10 sm:pt-14 sm:pb-20">
        <DoodleField />
        <Container className="relative max-w-2xl">
          <Link href="/resources" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow">
            &larr; Back to resources
          </Link>
          <div className="mt-4">
            <Ribbon>Guided exercise</Ribbon>
          </div>
          <h1 className="mt-4 font-display text-3xl font-medium leading-[1.1] text-brand-900 sm:text-4xl">
            Just breathe, on purpose.
          </h1>
          <p className="mt-4 text-lg text-ink/70">
            A paced, visual breathing guide — pick a pattern, follow the circle, and let your nervous system
            catch up with the moment.
          </p>
          <div className="mt-6">
            <BreathingStreakStats />
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-2xl">
          <BreathingTool />
        </Container>
      </section>
    </>
  );
}
