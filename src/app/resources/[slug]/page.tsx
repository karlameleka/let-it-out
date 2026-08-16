import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { Ribbon } from "@/components/decor";
import { ARTICLES } from "@/lib/content/articles";
import InteractiveArticle from "./interactive-article";

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
      <section className="bg-brand-50 pt-6 pb-10 sm:pt-14 sm:pb-20">
        <Container className="max-w-3xl">
          <Ribbon>{article.category}</Ribbon>
          <h1 className="mt-4 font-display text-3xl font-medium leading-[1.15] text-brand-900 sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-ink/70">{article.excerpt}</p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <InteractiveArticle article={article} />
        </Container>
      </section>
    </>
  );
}
