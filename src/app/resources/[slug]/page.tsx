import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, ButtonLink } from "@/components/ui";
import { Ribbon } from "@/components/decor";
import { ARTICLES } from "@/lib/content/articles";

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return {};
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) notFound();

  return (
    <>
      <section className="bg-brand-50 py-16 sm:py-20">
        <Container className="max-w-3xl">
          <Ribbon>{article.category}</Ribbon>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.15] text-brand-900 sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-ink/70">{article.excerpt}</p>
          <p className="mt-3 text-sm text-ink/50">{article.readMinutes} min read</p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          {article.sections.map((section) => (
            <section key={section.heading} className="mt-10 first:mt-0">
              <h2 className="font-display text-xl font-semibold text-brand-900">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-4 text-sm leading-relaxed text-ink/75 sm:text-base">
                {section.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {section.list && (
                  <ul className="list-disc space-y-3 pl-5">
                    {section.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          <div className="mt-10 border-t border-brand-100 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">References</p>
            <ol className="mt-2 space-y-1.5 text-xs text-ink/50">
              {article.references.map((ref, i) => (
                <li key={i}>
                  {i + 1}. {ref}
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12 rounded-2xl border-2 border-brand-100 bg-brand-50 p-6 text-center">
            <p className="font-display font-semibold text-brand-800">
              Want more support than a good read?
            </p>
            <p className="mt-2 text-sm text-ink/70">
              Our psychologist-led team offers 1:1 counseling and
              workplace workshops built on the same evidence-based
              approach.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/counseling">Book a session</ButtonLink>
              <ButtonLink href="/workshops" variant="outline">
                Explore workshops
              </ButtonLink>
            </div>
          </div>

          <p className="mt-8 text-center text-sm">
            <Link href="/resources" className="font-medium text-brand-600 underline">
              &larr; Back to all resources
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
