import "server-only";
import { prisma } from "@/lib/db";
import { getArticles } from "@/lib/content/articles";
import { getWorkshopTopics } from "@/lib/content/workshops";
import { getSiteSettings } from "@/lib/site-settings";
import type { Locale } from "@/lib/i18n/locale";

export type SearchItem = {
  type: "article" | "product" | "counselor" | "workshop";
  typeLabel: string;
  title: string;
  description: string;
  href: string;
};

export async function getSearchIndex(locale: Locale): Promise<SearchItem[]> {
  const [settings, products, counselors, articleList] = await Promise.all([
    getSiteSettings(),
    prisma.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.counselor.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getArticles(),
  ]);

  const articles: SearchItem[] = articleList.filter((a) => !settings.hiddenArticleSlugs.includes(a.slug)).map(
    (a) => ({
      type: "article",
      typeLabel: "Article",
      title: a.title,
      description: a.excerpt,
      href: `/resources/${a.slug}`,
    })
  );

  const productItems: SearchItem[] = products.map((p) => ({
    type: "product",
    typeLabel: "Journal",
    title: p.title,
    description: p.description,
    href: `/shop/${p.slug}`,
  }));

  const counselorItems: SearchItem[] = counselors.map((c) => ({
    type: "counselor",
    typeLabel: "Counselor",
    title: c.name,
    description: c.credentials,
    href: `/counseling/${c.slug}`,
  }));

  const workshopItems: SearchItem[] = getWorkshopTopics(locale).map((w) => ({
    type: "workshop",
    typeLabel: "Workshop topic",
    title: w.title,
    description: w.description,
    href: "/workshops",
  }));

  return [...articles, ...productItems, ...counselorItems, ...workshopItems];
}
