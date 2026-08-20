import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { Ribbon, DoodleField } from "@/components/decor";
import NextStepTool from "../next-step-tool";

export const metadata: Metadata = {
  title: "Tiny Next Step",
  description: "A behavioral activation exercise for when something feels stuck — shrink it to one tiny step.",
};

export default function NextStepPage() {
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
            Stuck? Shrink it down.
          </h1>
          <p className="mt-4 text-lg text-ink/70">
            A behavioral activation technique — name what&apos;s weighing on you, find the smallest possible
            first move, and commit to when you&apos;ll do it. About 1 minute.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-2xl">
          <NextStepTool />
        </Container>
      </section>
    </>
  );
}
