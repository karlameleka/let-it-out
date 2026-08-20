import type { Metadata } from "next";
import { Brain, Users } from "lucide-react";
import { Container } from "@/components/ui";
import { Ribbon, DoodleField } from "@/components/decor";
import ReframingTool from "./reframing-tool";

export const metadata: Metadata = {
  title: "Cognitive Reframing",
  description:
    "A guided CBT exercise for catching thinking traps and reframing automatic negative thoughts — with a shuffling bank of everyday scenarios.",
};

export default function CognitiveReframingPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-brand-50 pt-6 pb-10 sm:pt-14 sm:pb-20">
        <DoodleField />
        <Container className="relative max-w-2xl">
          <Ribbon>Interactive exercise</Ribbon>
          <h1 className="mt-4 font-display text-3xl font-medium leading-[1.1] text-brand-900 sm:text-4xl">
            Catch the thought. Question it. Reframe it.
          </h1>
          <p className="mt-4 text-lg text-ink/70">
            A short CBT technique called cognitive reframing — pick a scenario, spot the thinking trap, weigh the
            evidence, and land on something more balanced. Shuffle for a new scenario any time.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-brand-100 bg-white p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Brain className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <p className="mt-3 font-display text-base font-semibold text-brand-900">What&apos;s an automatic thought?</p>
              <p className="mt-1.5 text-sm text-ink/65">
                The split-second reaction your brain fires off before you&apos;ve had a chance to think —
                &ldquo;I&apos;m going to fail this,&rdquo; &ldquo;they&apos;re judging me.&rdquo; It arrives so
                fast and feels so certain that we rarely stop to question it, even though it&apos;s usually
                shaped more by mood and old habits than by what&apos;s actually happening.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-brand-100 bg-white p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Users className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <p className="mt-3 font-display text-base font-semibold text-brand-900">You&apos;re not the only one</p>
              <p className="mt-1.5 text-sm text-ink/65">
                The patterns these thoughts fall into — psychologists call them thinking traps, or cognitive
                distortions — are ones basically everyone runs into sometimes, especially when tired or
                stressed. Spotting yours isn&apos;t a flaw to fix. It&apos;s a skill, and it&apos;s exactly
                what this exercise helps you practice.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-2xl">
          <ReframingTool />
        </Container>
      </section>
    </>
  );
}
