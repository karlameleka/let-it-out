import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  list?: string[];
};

/** A reflective check-in shown after a section — picking any option unlocks
 * the next one. There's no "right" answer. */
export type ArticleCheckIn = {
  prompt: string;
  options: string[];
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  sections: ArticleSection[];
  /** One check-in per section, in reading order — checkIns[i] gates
   * sections[i + 1] (or the closing references/CTA, for the last one). */
  checkIns: ArticleCheckIn[];
  references: string[];
};

function rowToArticle(row: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  sections: unknown;
  checkIns: unknown;
  references: string[];
}): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    readMinutes: row.readMinutes,
    sections: row.sections as ArticleSection[],
    checkIns: row.checkIns as ArticleCheckIn[],
    references: row.references,
  };
}

// Content is admin-authored and changes rarely — cached per-request like
// the rest of this project's site-configuration reads.
export const getArticles = cache(async (): Promise<Article[]> => {
  const rows = await prisma.article.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map(rowToArticle);
});

export const getArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  const row = await prisma.article.findUnique({ where: { slug } });
  return row ? rowToArticle(row) : null;
});

export async function getArticleById(id: string): Promise<Article | null> {
  const row = await prisma.article.findUnique({ where: { id } });
  return row ? rowToArticle(row) : null;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base || "article";
  let n = 2;
  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${n++}`;
  }
}

function parseArticleFormData(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const readMinutes = Number(formData.get("readMinutes")) || 5;
  const sections = JSON.parse(String(formData.get("sectionsJson") ?? "[]")) as ArticleSection[];
  const checkIns = JSON.parse(String(formData.get("checkInsJson") ?? "[]")) as ArticleCheckIn[];
  const references = String(formData.get("references") ?? "")
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);
  return { title, excerpt, category, readMinutes, sections, checkIns, references };
}

export async function createArticle(formData: FormData) {
  "use server";
  await requireAdmin();
  const data = parseArticleFormData(formData);
  const slug = await uniqueSlug(slugify(data.title));
  const maxSort = await prisma.article.aggregate({ _max: { sortOrder: true } });

  await prisma.article.create({
    data: { ...data, slug, sortOrder: (maxSort._max.sortOrder ?? -1) + 1 },
  });

  revalidatePath("/resources");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function updateArticle(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const data = parseArticleFormData(formData);
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return;

  // Slug stays stable once published unless the title changes drastically
  // enough that regenerating still lands on something reasonable — simplest
  // and safest is to just keep the existing slug so published links never break.
  await prisma.article.update({ where: { id }, data });

  revalidatePath("/resources");
  revalidatePath(`/resources/${existing.slug}`);
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function deleteArticle(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return;
  await prisma.article.delete({ where: { id } });
  revalidatePath("/resources");
  revalidatePath("/admin/articles");
}
