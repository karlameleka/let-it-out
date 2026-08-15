import type { Metadata } from "next";
import Link from "next/link";
import {
  AmbientGlow,
  Badge,
  ButtonLink,
  Container,
  EmptyState,
  SectionHeading,
  surfaceClass,
} from "@/components/ui";
import { Ribbon, Swash, DoodleField } from "@/components/decor";
import { BookmarkMark } from "@/components/illustrations";
import { ARTICLES } from "@/lib/content/articles";

export const metadata: Metadata = {
  title: "Resources",
  description: "Short, science-backed reads on stress management and healthy self-care habits from Let It Out.",
};

export default function ResourcesPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50 via-brand-50/60 to-white py-20 sm:py-28">
        <AmbientGlow palette="brand" intensity={0.2} />
        <DoodleField />
        <Container className="relative">
          <Ribbon>Free resources</Ribbon>
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.14] tracking-tight text-brand-900 sm:text-[3.4rem]">
            Short reads, backed by{" "}
            <span className="mark-swash italic text-brand-700">
              real research<Swash />
            </span>
            .
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-body">
            A few of our favorite science-informed ideas on stress and
            self-care, written to be genuinely useful in the time it takes
            for a coffee break.
          </p>
        </Container>
      </section>


      <section className="pb-24 pt-6 sm:pb-28">
        <Container>
          <SectionHeading eyebrow="Read" title="Latest articles" />

          {ARTICLES.length === 0 ? (
            <EmptyState
              className="mt-12 max-w-2xl"
              illustration={<BookmarkMark className="h-9 w-9" />}
              title="New reads are in the works"
              description="We're writing the next round of science-informed pieces on stress and self-care. In the meantime, the guided journals cover the same ground, page by page."
              action={<ButtonLink href="/shop">Browse guided journals</ButtonLink>}
            />
          ) : (
            <div className="mt-14 grid gap-7 sm:grid-cols-2">
              {ARTICLES.map((article, i) => (
                <Link
                  key={article.slug}
                  href={`/resources/${article.slug}`}
                  className={`group animate-rise-in flex flex-col p-8 ${surfaceClass()}`}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{article.category}</Badge>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
                      {article.readMinutes} min read
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold leading-snug tracking-tight text-brand-900 transition-colors duration-300 ease-out group-hover:text-brand-600">
                    {article.title}
                  </h3>
                  <p className="mt-3.5 flex-1 text-sm leading-relaxed text-ink-body">
                    {article.excerpt}
                  </p>
                  <p className="link-grow mt-6 w-fit text-sm font-medium text-brand-600">
                    Read article &rarr;
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
