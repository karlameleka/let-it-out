import { notFound } from "next/navigation";
import { getArticleById, updateArticle } from "@/lib/content/articles";
import ArticleForm from "@/components/article-form";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-brand-900">Edit article</h1>
      <p className="mt-1 text-sm text-ink/60">/resources/{article.slug}</p>
      <div className="mt-6">
        <ArticleForm article={article} action={updateArticle} />
      </div>
    </div>
  );
}
