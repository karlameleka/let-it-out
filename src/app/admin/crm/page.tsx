import Link from "next/link";
import { prisma } from "@/lib/db";
import { updateLeadStatus } from "@/lib/admin-actions";

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
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const activeType = type && type !== "ALL" ? type : "ALL";

  const leads = await prisma.lead.findMany({
    where: activeType !== "ALL" ? { type: activeType as never } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink/60">
          {leads.length} {leads.length === 1 ? "lead" : "leads"} — every real workshop inquiry,
          counseling request, journal order, and contact message lands here automatically.
        </p>
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

                      <form action={updateLeadStatus} className="flex shrink-0 items-center gap-2">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
