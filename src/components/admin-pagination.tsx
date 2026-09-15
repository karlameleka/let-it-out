import Link from "next/link";

/** Prev/Next control for a paginated admin list — see admin-pagination.ts
 * for the shared page-size constant and page-param parsing every admin
 * list page that reads from a table a public form can write to now uses,
 * instead of loading every row unconditionally. */
export default function AdminPagination({
  page,
  totalPages,
  basePath,
  pageParam = "page",
  extraParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  /** Query param name for the page number — override when a page has more
   * than one independently paginated list (e.g. "sessionPage"/"bookingPage"
   * on /admin/bookings). Defaults to "page". */
  pageParam?: string;
  extraParams?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams(extraParams);
    params.set(pageParam, String(p));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-lg border border-brand-100 px-3 py-1.5 text-sm font-medium text-ink/30">Previous</span>
      )}
      <span className="text-sm text-ink/60">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-lg border border-brand-100 px-3 py-1.5 text-sm font-medium text-ink/30">Next</span>
      )}
    </div>
  );
}
