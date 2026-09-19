import { Star } from "lucide-react";
import { prisma } from "@/lib/db";
import AdminPagination from "@/components/admin-pagination";
import { ADMIN_PAGE_SIZE, parseAdminPage } from "@/lib/admin-pagination";

const SERVICE_LABELS: Record<string, string> = {
  COUNSELING: "Counseling",
  JOURNALS: "Guided Journals",
  WORKSHOPS: "Workshops",
  RESOURCES: "Resources",
  SHOP: "Shop",
  APP_GENERAL: "App overall",
};

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = parseAdminPage(pageParam);

  const [items, totalCount, avg] = await Promise.all([
    prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.feedback.count(),
    prisma.feedback.aggregate({ _avg: { rating: true } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_PAGE_SIZE));
  const avgRating = avg._avg.rating;

  return (
    <div>
      <p className="mb-4 text-sm text-ink/60">
        {totalCount} feedback submission{totalCount === 1 ? "" : "s"}
        {avgRating != null && ` · average rating ${avgRating.toFixed(1)}/5`}
        {totalPages > 1 && ` · Showing page ${page} of ${totalPages}.`}
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-ink/60">No feedback yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <div key={f.id} className="rounded-2xl border border-brand-100 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-brand-900">{SERVICE_LABELS[f.service] ?? f.service}</p>
                  <p className="text-xs text-ink/50">
                    {f.user.name} · {f.user.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center" aria-label={`${f.rating}/5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`h-4 w-4 ${n <= f.rating ? "fill-brand-500 text-brand-500" : "fill-none text-brand-200"}`}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-ink/40">{f.createdAt.toLocaleString("en-GB")}</span>
                </div>
              </div>
              {f.comment && <p className="mt-3 whitespace-pre-line text-sm text-ink/70">{f.comment}</p>}
            </div>
          ))}
        </div>
      )}
      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/feedback" />
    </div>
  );
}
