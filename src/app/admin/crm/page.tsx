import Link from "next/link";
import { prisma } from "@/lib/db";
import { updateLeadStatus, deleteLead, deleteRecentLeads } from "@/lib/admin-actions";
import ConfirmSubmitButton from "@/components/confirm-submit-button";
import AdminPagination from "@/components/admin-pagination";
import { ADMIN_PAGE_SIZE, parseAdminPage } from "@/lib/admin-pagination";

const RECENT_HOURS = 48;

const TYPE_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "WORKSHOP_LEAD", label: "Workshop Leads" },
  { value: "COUNSELING_INQUIRY", label: "Counseling Inquiries" },
  { value: "JOURNAL_CUSTOMER", label: "Journal Customers" },
  { value: "GENERAL_INQUIRY", label: "General Inquiries" },
  { value: "ACCOUNT_SIGNUP", label: "Account Signups" },
  { value: "RESOURCE_NOTIFY", label: "Resource Notify Signups" },
];

const TYPE_LABELS: Record<string, string> = {
  WORKSHOP_LEAD: "Workshop Lead",
  COUNSELING_INQUIRY: "Counseling Inquiry",
  JOURNAL_CUSTOMER: "Journal Customer",
  GENERAL_INQUIRY: "General Inquiry",
  ACCOUNT_SIGNUP: "Account Signup",
  RESOURCE_NOTIFY: "Resource Notify",
};

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function AdminCrmPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string }>;
}) {
  const { type, page: pageParam } = await searchParams;
  const activeType = type && type !== "ALL" ? type : "ALL";
  const page = parseAdminPage(pageParam);

  const where = activeType !== "ALL" ? { type: activeType as never } : undefined;
  const recentCutoff = new Date();
  recentCutoff.setHours(recentCutoff.getHours() - RECENT_HOURS);
  const [leads, totalCount, recentCount] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.lead.count({ where }),
    prisma.lead.count({ where: { createdAt: { gte: recentCutoff } } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_PAGE_SIZE));

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-sm text-ink/60">
            {totalCount} {totalCount === 1 ? "lead" : "leads"} — every real workshop inquiry,
            counseling request, journal order, and contact message lands here automatically.
            {totalPages > 1 && ` Showing page ${page} of ${totalPages}.`}
          </p>
          {recentCount > 0 && (
            <form action={deleteRecentLeads}>
              <ConfirmSubmitButton
                confirmMessage={`Delete all ${recentCount} lead(s) received in the last ${RECENT_HOURS} hours? This deletes every type, including any real leads from that window — check the list below first if you're not sure. This can't be undone.`}
                className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Delete last {RECENT_HOURS}h ({recentCount})
              </ConfirmSubmitButton>
            </form>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {TYPE_FILTERS.map((t) => (
            <Link
              key={t.value}
              href={t.value === "ALL" ? "/admin/crm" : `/admin/crm?type=${t.value}`}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                activeType === t.value
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-brand-200 bg-white text-ink/70 hover:border-brand-400"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {leads.length === 0 ? (
        <p className="text-sm text-ink/60">No leads yet.</p>
      ) : (
        STATUSES.map((status) => {
          const group = leads.filter((l) => l.status === status);
          if (group.length === 0) return null;
          return (
            <div key={status}>
              <h2 className="font-display font-semibold text-brand-900">
                {statusLabel(status)}{" "}
                <span className="text-sm font-normal text-ink/40">({group.length})</span>
              </h2>
              <div className="mt-3 space-y-3">
                {group.map((lead) => (
                  <div key={lead.id} className="rounded-2xl border border-brand-100 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                          {TYPE_LABELS[lead.type]}
                        </span>
                        <p className="mt-1.5 font-display font-semibold text-brand-800">{lead.name}</p>
                        <p className="text-sm text-ink/60">
                          {[lead.email, lead.phone].filter(Boolean).join(" · ") || "No contact info"}
                        </p>
                        {(lead.sessionType || lead.groupSize || lead.orderTotalEGP || lead.paymentMethod) && (
                          <p className="mt-1 text-sm text-ink/60">
                            {[
                              lead.sessionType && `Session: ${lead.sessionType}`,
                              lead.groupSize && `Group size: ${lead.groupSize}`,
                              lead.orderTotalEGP && `Order: EGP ${lead.orderTotalEGP}`,
                              lead.paymentMethod,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                        {lead.notes && (
                          <p className="mt-2 whitespace-pre-line text-sm text-ink/60">{lead.notes}</p>
                        )}
                        <p className="mt-2 text-xs text-ink/40">
                          {lead.source && `${lead.source} · `}
                          {lead.createdAt.toLocaleString("en-GB")}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <form action={updateLeadStatus} className="flex items-center gap-2">
                          <input type="hidden" name="leadId" value={lead.id} />
                          <select
                            name="status"
                            defaultValue={lead.status}
                            className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {statusLabel(s)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                          >
                            Update
                          </button>
                        </form>
                        <form action={deleteLead}>
                          <input type="hidden" name="leadId" value={lead.id} />
                          <ConfirmSubmitButton
                            confirmMessage="Delete this lead permanently? This can't be undone."
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/crm"
        extraParams={activeType !== "ALL" ? { type: activeType } : {}}
      />
    </div>
  );
}
