import { prisma } from "@/lib/db";
import { deleteContactMessage, deleteRecentContactMessages } from "@/lib/admin-actions";
import ConfirmSubmitButton from "@/components/confirm-submit-button";
import AdminPagination from "@/components/admin-pagination";
import { ADMIN_PAGE_SIZE, parseAdminPage } from "@/lib/admin-pagination";

const RECENT_HOURS = 48;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = parseAdminPage(pageParam);
  const recentCutoff = new Date();
  recentCutoff.setHours(recentCutoff.getHours() - RECENT_HOURS);

  const [messages, totalCount, recentCount] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { createdAt: { gte: recentCutoff } } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-ink/60">
          {totalCount} {totalCount === 1 ? "message" : "messages"}
          {totalPages > 1 && ` — showing page ${page} of ${totalPages}`}
        </p>
        {recentCount > 0 && (
          <form action={deleteRecentContactMessages}>
            <ConfirmSubmitButton
              confirmMessage={`Delete all ${recentCount} message(s) received in the last ${RECENT_HOURS} hours? This includes any real messages from that window — check the list below first if you're not sure. This can't be undone.`}
              className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Delete last {RECENT_HOURS}h ({recentCount})
            </ConfirmSubmitButton>
          </form>
        )}
      </div>
      {messages.length === 0 && <p className="text-sm text-ink/60">No messages yet.</p>}
      {messages.map((m) => (
        <div key={m.id} className="rounded-2xl border border-brand-100 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-display font-semibold text-brand-800">{m.subject}</p>
              <p className="text-sm text-ink/60">{m.name} · {m.email}</p>
            </div>
            <form action={deleteContactMessage}>
              <input type="hidden" name="id" value={m.id} />
              <ConfirmSubmitButton
                confirmMessage="Delete this message permanently? This can't be undone."
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Delete
              </ConfirmSubmitButton>
            </form>
          </div>
          <p className="mt-2 text-sm text-ink/70">{m.message}</p>
          <p className="mt-1 text-xs text-ink/40">{m.createdAt.toLocaleString("en-GB")}</p>
        </div>
      ))}
      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/messages" />
    </div>
  );
}
