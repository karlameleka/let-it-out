import type { Metadata } from "next";
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
      <section className="relative overflow-hidden bg-brand-50 py-16 sm:py-20">
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
