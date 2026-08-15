import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AmbientGlow,
  Badge,
  ButtonLink,
  Container,
  Surface,
  focusRing,
  motionEase,
} from "@/components/ui";
import { Ribbon, DoodleField } from "@/components/decor";
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
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50 via-brand-50/60 to-white py-20 sm:py-24">
        <AmbientGlow palette="brand" intensity={0.18} />
        <DoodleField />
        <Container className="relative max-w-3xl">
          <Ribbon>{article.category}</Ribbon>
          <h1 className="mt-6 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-brand-900 sm:text-[2.75rem]">
            {article.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-body">{article.excerpt}</p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
            {article.readMinutes} min read
          </p>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container className="max-w-3xl">
          {article.sections.map((section) => (
            <section key={section.heading} className="mt-14 first:mt-0">
              <h2 className="font-display text-2xl font-semibold leading-snug tracking-tight text-brand-900">
                {section.heading}
              </h2>
              {/* Article bodies use the long-form rhythm: looser leading and
                  wider paragraph spacing than UI copy, for sustained reading. */}
              <div className="prose-longform mt-5 text-base text-ink-body">
                {section.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {section.list && (
                  <ul className="mt-6 list-none space-y-4 pl-0">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex gap-3.5">
                        <span
                          aria-hidden="true"
                          className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          <div className="mt-16 border-t border-brand-900/10 pt-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-faint">
              References
            </p>
            <ol className="mt-4 space-y-2 text-xs leading-relaxed text-ink-faint">
              {article.references.map((ref, i) => (
                <li key={i}>
                  {i + 1}. {ref}
                </li>
              ))}
            </ol>
          </div>

          <Surface className="relative mt-16 overflow-hidden px-6 py-12 text-center sm:px-10">
            <AmbientGlow palette="brand" intensity={0.22} />
            <div className="relative">
              <Badge className="mb-5">Keep going</Badge>
              <p className="font-display text-2xl font-semibold tracking-tight text-brand-900">
                Want more support than a good read?
              </p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
                Our psychologist-led team offers 1:1 counseling and workplace
                workshops built on the same evidence-based approach.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/counseling">Book a session</ButtonLink>
                <ButtonLink href="/workshops" variant="outline">
                  Explore workshops
                </ButtonLink>
              </div>
            </div>
          </Surface>

          <p className="mt-10 text-center text-sm">
            <Link
              href="/resources"
              className={`link-grow inline-block rounded-md font-medium text-brand-600 ${motionEase} ${focusRing} hover:text-brand-700`}
            >
              &larr; Back to all resources
            </Link>
          </p>
        </Container>
      </section>
    </>
  );
}
