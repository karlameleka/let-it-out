import { prisma } from "@/lib/db";
import { updateWorkshopInquiryStatus } from "@/lib/admin-actions";

const STATUSES = ["NEW", "IN_DISCUSSION", "SCHEDULED", "CLOSED"];

export default async function AdminWorkshopsPage() {
  const inquiries = await prisma.workshopInquiry.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      {inquiries.length === 0 && <p className="text-sm text-ink/60">No workshop inquiries yet.</p>}
      {inquiries.map((i) => (
        <div key={i.id} className="rounded-2xl border border-brand-100 bg-white p-5">
          <p className="font-display font-semibold text-brand-800">
            {i.organizationName} — {i.workshopTopic}
          </p>
          <p className="text-sm text-ink/60">
            {i.contactName} · {i.email} · {i.phone}
          </p>
          {(i.groupSize || i.preferredDates) && (
            <p className="mt-1 text-sm text-ink/60">
              {i.groupSize && `Group size: ${i.groupSize}`}
              {i.groupSize && i.preferredDates && " · "}
              {i.preferredDates && `Preferred dates: ${i.preferredDates}`}
            </p>
          )}
          {i.message && <p className="mt-2 text-sm text-ink/60">&ldquo;{i.message}&rdquo;</p>}
          <p className="mt-1 text-xs text-ink/40">{i.createdAt.toLocaleString("en-GB")}</p>

          <form action={updateWorkshopInquiryStatus} className="mt-4 flex items-center gap-2">
            <input type="hidden" name="inquiryId" value={i.id} />
            <select
              name="status"
              defaultValue={i.status}
              className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
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
      ))}
    </div>
  );
}
