import Link from "next/link";
import { getArticles, deleteArticle } from "@/lib/content/articles";
import ConfirmSubmitButton from "@/components/confirm-submit-button";

export default async function AdminArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink/60">{articles.length} article{articles.length === 1 ? "" : "s"}</p>
        <Link
          href="/admin/articles/new"
          className="rounded bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)]"
        >
          + Add new article
        </Link>
      </div>

      {articles.length === 0 && <p className="text-sm text-ink/60">No articles yet.</p>}

      {articles.map((a) => (
        <div key={a.id} className="rounded-2xl border border-brand-100 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-display font-semibold text-brand-800">{a.title}</p>
              <p className="mt-1 text-sm text-ink/60">
                {a.category} &middot; {a.readMinutes} min read &middot; {a.sections.length} section
                {a.sections.length === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-xs text-ink/40">/resources/{a.slug}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/articles/${a.id}`}
              className="rounded-lg border border-brand-200 px-3.5 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              Edit
            </Link>
            <Link
              href={`/resources/${a.slug}`}
              target="_blank"
              className="rounded-lg border border-brand-200 px-3.5 py-2 text-sm font-medium text-ink/70 hover:bg-brand-50"
            >
              View live
            </Link>
            <form action={deleteArticle}>
              <input type="hidden" name="id" value={a.id} />
              <ConfirmSubmitButton
                confirmMessage={`Delete "${a.title}" permanently? This can't be undone.`}
                className="rounded-lg border border-red-200 px-3.5 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Delete
              </ConfirmSubmitButton>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
