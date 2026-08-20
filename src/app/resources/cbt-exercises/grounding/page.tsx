import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { Ribbon, DoodleField } from "@/components/decor";
import GroundingTool from "../grounding-tool";

export const metadata: Metadata = {
  title: "5-4-3-2-1 Grounding",
  description: "A short sensory grounding exercise to pull your attention back into the present moment.",
};

export default function GroundingPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-brand-50 pt-6 pb-10 sm:pt-14 sm:pb-20">
        <DoodleField />
        <Container className="relative max-w-2xl">
          <Link
            href="/resources/cbt-exercises"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow"
          >
            &larr; Back to CBT exercises
          </Link>
          <div className="mt-4">
            <Ribbon>Interactive exercise</Ribbon>
          </div>
          <h1 className="mt-4 font-display text-3xl font-medium leading-[1.1] text-brand-900 sm:text-4xl">
            Come back to right here, right now.
          </h1>
          <p className="mt-4 text-lg text-ink/70">
            A sensory grounding technique — notice five things you can see, four you can feel, three you can
            hear, two you can smell, one you can taste. About 2 minutes.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-2xl">
          <GroundingTool />
        </Container>
      </section>
    </>
  );
}
