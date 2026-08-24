import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, Wind } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";
import { Ribbon, Swash, WaveDivider } from "@/components/decor";
import { JournalIcon } from "@/components/lio-icons";
import ArticleFilter from "./article-filter";
import { Reveal } from "@/components/reveal";
import { getSiteSettings } from "@/lib/site-settings";
import { getArticles } from "@/lib/content/articles";

export const metadata: Metadata = {
  title: "Resources",
  description: "Short, science-backed reads on stress management and healthy self-care habits from Let It Out.",
};

export default async function ResourcesPage() {
  const [settings, articleList] = await Promise.all([getSiteSettings(), getArticles()]);

  const journalPromo = settings.resourcesPromoHidden ? null : (
    <section className="pt-2 pb-8 sm:py-10 scroll-mt-24" id="journal-promo" key="journal-promo">
      <Reveal>
        <Container>
          <SectionHeading eyebrow="Practice" title="Make it a daily habit" />
          <Link
            href="/journal"
            className="group mt-10 flex flex-col gap-6 overflow-hidden rounded-3xl border-2 border-brand-700 bg-brand-700 p-6 text-white shadow-sm transition-all hover:-translate-y-1 active:-translate-y-1 hover:shadow-lg active:shadow-lg sm:flex-row sm:items-center sm:p-8"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <JournalIcon className="h-7 w-7" />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">Journaling app</p>
              <h3 className="mt-1 font-display text-xl font-semibold">Let it out. One page at a time.</h3>
              <p className="mt-1.5 text-sm text-brand-50/85">
                A private, guided space to process your thoughts, track your mood, and build a daily
                reflection habit.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold link-grow w-fit">
              Start journaling <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </span>
          </Link>
        </Container>
      </Reveal>
    </section>
  );

  const cbtPromo = (
    <section className="pt-2 pb-8 sm:py-10" key="cbt-promo">
      <Reveal>
        <Container>
          <Link
            href="/resources/cbt-exercises"
            className="group flex flex-col gap-6 overflow-hidden rounded-3xl border-2 border-brand-900 bg-brand-900 p-6 text-white shadow-sm transition-all hover:-translate-y-1 active:-translate-y-1 hover:shadow-lg active:shadow-lg sm:flex-row sm:items-center sm:p-8"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Brain className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">CBT toolkit</p>
              <h3 className="mt-1 font-display text-xl font-semibold">Practice a quick evidence-based technique</h3>
              <p className="mt-1.5 text-sm text-brand-50/85">
                A couple of minutes. Short, practical, evidence-based CBT exercises; reframe a thought,
                ground yourself, or take one tiny step.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold link-grow w-fit">
              Try an exercise <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </span>
          </Link>
        </Container>
      </Reveal>
    </section>
  );

  const breathingPromo = (
    <section className="pt-2 pb-8 sm:py-10" key="breathing-promo">
      <Reveal>
        <Container>
          <Link
            href="/resources/breathing"
            className="group flex flex-col gap-6 overflow-hidden rounded-3xl border-2 border-brand-600 bg-brand-600 p-6 text-white shadow-sm transition-all hover:-translate-y-1 active:-translate-y-1 hover:shadow-lg active:shadow-lg sm:flex-row sm:items-center sm:p-8"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Wind className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-100">Breathing exercise</p>
              <h3 className="mt-1 font-display text-xl font-semibold">Just need to reset for a minute?</h3>
              <p className="mt-1.5 text-sm text-brand-50/85">
                A guided, paced breathing exercise — box breathing, 4-7-8, or coherent breathing, with a
                visual guide to slow things down.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold link-grow w-fit">
              Start breathing <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </span>
          </Link>
        </Container>
      </Reveal>
    </section>
  );

  const articles = (
    <section className="pt-2 pb-8 sm:py-10" key="articles">
      <Reveal>
        <Container>
          <SectionHeading eyebrow="Read" title="Latest articles" />
          <ArticleFilter articles={articleList} hiddenSlugs={settings.hiddenArticleSlugs} />
        </Container>
      </Reveal>
    </section>
  );

  const sections =
    settings.resourcesPromoPlacement === "BOTTOM"
      ? [articles, journalPromo, cbtPromo, breathingPromo]
      : [journalPromo, cbtPromo, breathingPromo, articles];

  return (
    <>
      <section className="bg-brand-50 pt-6 pb-4 sm:pt-14 sm:pb-20">
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

      {sections}
    </>
  );
}
