import type { Metadata } from "next";
import Link from "next/link";
import { Brain, ArrowRight } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";
import { Ribbon, Swash, WaveDivider } from "@/components/decor";
import ArticleFilter from "./article-filter";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Resources",
  description: "Short, science-backed reads on stress management and healthy self-care habits from Let It Out.",
};

export default function ResourcesPage() {
  return (
    <>
      <section className="bg-brand-50 py-16 sm:py-20">
        <Container>
          <Ribbon>Free resources</Ribbon>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-brand-900 sm:text-5xl">
            Short reads, backed by{" "}
            <span className="mark-swash italic text-brand-700">
              real research<Swash />
            </span>
            .
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">
            A few of our favorite science-informed ideas on stress and
            self-care, written to be genuinely useful in the time it takes
            for a coffee break.
          </p>
        </Container>
      </section>

      <WaveDivider fill="fill-white" />

      <section className="pb-4 pt-4 sm:pb-8">
        <Reveal>
          <Container>
            <SectionHeading eyebrow="Practice" title="Interactive exercises" />
            <Link
              href="/resources/cognitive-reframing"
              className="group mt-10 flex flex-col gap-6 overflow-hidden rounded-3xl border-2 border-brand-700 bg-brand-700 p-6 text-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:flex-row sm:items-center sm:p-8"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Brain className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">CBT exercise</p>
                <h3 className="mt-1 font-display text-xl font-semibold">Cognitive Reframing</h3>
                <p className="mt-1.5 text-sm text-brand-50/85">
                  Shuffle through everyday scenarios, spot the thinking trap, and practice landing on a more
                  balanced thought.
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold link-grow w-fit">
                Try it <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </span>
            </Link>
          </Container>
        </Reveal>
      </section>

      <section className="pb-16 pt-8 sm:pb-20">
        <Reveal>
          <Container>
            <SectionHeading eyebrow="Read" title="Latest articles" />
            <ArticleFilter />
          </Container>
        </Reveal>
      </section>
    </>
  );
}
