import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { Ribbon } from "@/components/decor";
import { getArticles, getArticleBySlug, localizeArticle } from "@/lib/content/articles";
import InteractiveArticle from "./interactive-article";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const rawArticle = await getArticleBySlug(slug);
  if (!rawArticle) notFound();
  const article = localizeArticle(rawArticle, locale);
  const dict = getDictionary(locale);

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
          <InteractiveArticle article={article} dict={dict.interactiveArticle} notifyDict={dict.resourceNotifyBell} />
        </Container>
      </section>
    </>
  );
}
