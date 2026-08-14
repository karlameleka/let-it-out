import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui";
import { Ribbon, Swash, WaveDivider } from "@/components/decor";
import { ARTICLES } from "@/lib/content/articles";
import ArticleProgressBadge from "./article-progress-badge";

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
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.1] text-brand-900 sm:text-5xl">
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

      <section className="pb-16 pt-4 sm:pb-20">
        <Container>
          <SectionHeading eyebrow="Read" title="Latest articles" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {ARTICLES.map((article) => (
              <Link
                key={article.slug}
                href={`/resources/${article.slug}`}
                className="group rounded-2xl border-2 border-brand-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <p className="flex items-center text-xs font-semibold uppercase tracking-wide text-brand-500">
                  {article.category} · {article.readMinutes} min read
                  <ArticleProgressBadge slug={article.slug} totalMilestones={article.sections.length + 1} />
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-brand-900 group-hover:text-brand-600">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm text-ink/60">{article.excerpt}</p>
                <p className="mt-4 text-sm font-medium text-brand-600 link-grow w-fit">
                  Read article &rarr;
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
