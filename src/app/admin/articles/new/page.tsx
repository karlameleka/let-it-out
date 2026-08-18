import { createArticle } from "@/lib/content/articles";
import ArticleForm from "@/components/article-form";

export default function NewArticlePage() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-brand-900">New article</h1>
      <p className="mt-1 text-sm text-ink/60">The URL slug is generated from the title automatically.</p>
      <div className="mt-6">
        <ArticleForm action={createArticle} />
      </div>
    </div>
  );
}
