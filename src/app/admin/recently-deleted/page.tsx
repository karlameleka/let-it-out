import { prisma } from "@/lib/db";
import { TRASH_RETENTION_MS } from "@/lib/trash";
import AdminPagination from "@/components/admin-pagination";
import { ADMIN_PAGE_SIZE, parseAdminPage } from "@/lib/admin-pagination";
import RestoreButton from "./restore-button";
import { CAIRO_TIME_ZONE } from "@/lib/timezone";

const MODEL_LABEL: Record<string, string> = {
  Order: "Order",
  BookingRequest: "Booking request",
  SessionBooking: "Paid session",
  WorkshopInquiry: "Workshop inquiry",
  WorkshopInterestSignup: "Workshop notify signup",
  ContactMessage: "Contact message",
  Lead: "CRM lead",
  PromoCode: "Promo code",
  Product: "Product",
  Counselor: "Counselor",
  CounselorFilter: "Counseling filter",
  Article: "Article",
  Event: "Event",
  SupportChat: "Support chat",
};

function timeLeftLabel(deletedAt: Date): string {
  const msLeft = deletedAt.getTime() + TRASH_RETENTION_MS - Date.now();
  if (msLeft <= 0) return "Purging soon";
  const hoursLeft = Math.floor(msLeft / (60 * 60 * 1000));
  if (hoursLeft >= 1) return `${hoursLeft}h left`;
  const minutesLeft = Math.max(1, Math.floor(msLeft / (60 * 1000)));
  return `${minutesLeft}m left`;
}

export default async function AdminRecentlyDeletedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = parseAdminPage(sp.page);

  const [items, totalCount] = await Promise.all([
    prisma.trashedItem.findMany({
      orderBy: { deletedAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.trashedItem.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-brand-900">Recently deleted</h2>
        <p className="mt-1 text-sm text-ink/60">
          Every admin delete lands here first — restorable for 24 hours, then purged automatically. Full account
          deletions aren&rsquo;t covered (see /admin/clients), everything else deleted from the dashboard is.
        </p>
      </div>

      <p className="text-sm text-ink/60">
        {totalCount} item{totalCount === 1 ? "" : "s"}
        {totalPages > 1 && `, showing page ${page} of ${totalPages}`}
      </p>

      <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white">
        {items.length === 0 ? (
          <p className="p-6 text-sm text-ink/50">Nothing in the trash right now.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-brand-100 bg-brand-50/50 text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">Deleted</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">By</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-ink/60">{item.deletedAt.toLocaleString("en-GB", { timeZone: CAIRO_TIME_ZONE })}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                      {MODEL_LABEL[item.modelName] ?? item.modelName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/80">{item.summary}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink/60">{item.deletedByEmail ?? "System"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink/50">{timeLeftLabel(item.deletedAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <RestoreButton trashId={item.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/recently-deleted" />
    </div>
  );
}
