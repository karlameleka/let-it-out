import { prisma } from "@/lib/db";
import { createCounselingFilter, deleteCounselingFilter } from "@/lib/admin-actions";
import ConfirmSubmitButton from "@/components/confirm-submit-button";

export default async function AdminCounselingFiltersPage() {
  const filters = await prisma.counselorFilter.findMany({
    orderBy: { sortOrder: "asc" },
    include: { counselors: { include: { counselor: { select: { name: true } } } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-brand-900">Counseling filters</h1>
        <p className="mt-1 text-sm text-ink/60">
          The filter chips shown above the search bar on /counseling. Assign each filter to the counselors it
          applies to from that counselor&rsquo;s own page under Counselors.
        </p>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-display font-semibold text-brand-900">New filter</h2>
        <form action={createCounselingFilter} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="label">Label</label>
            <input
              id="label"
              name="label"
              required
              placeholder="e.g. Prescribes medication"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="labelAr">
              Arabic label <span className="text-ink/40">(optional)</span>
            </label>
            <input
              id="labelAr"
              name="labelAr"
              dir="rtl"
              placeholder="اختياري"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)]"
            >
              Add filter
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {filters.length === 0 && <p className="text-sm text-ink/60">No filters yet.</p>}
        {filters.map((f) => (
          <div key={f.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-white p-5">
            <div>
              <p className="font-display font-semibold text-brand-900">{f.label}</p>
              {f.labelAr && <p className="text-sm text-ink/60" dir="rtl">{f.labelAr}</p>}
              <p className="mt-1 text-xs text-ink/40">
                {f.counselors.length === 0
                  ? "Not assigned to any counselor yet"
                  : f.counselors.map((c) => c.counselor.name).join(", ")}
              </p>
            </div>
            <form action={deleteCounselingFilter}>
              <input type="hidden" name="id" value={f.id} />
              <ConfirmSubmitButton
                confirmMessage={`Remove the "${f.label}" filter? It will disappear from /counseling immediately.`}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Remove
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
