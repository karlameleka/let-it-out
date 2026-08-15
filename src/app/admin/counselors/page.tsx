import { prisma } from "@/lib/db";
import { updateCounselorPlacement } from "@/lib/admin-actions";

export default async function AdminCounselorsPage() {
  const counselors = await prisma.counselor.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink/60">
        Uncheck &ldquo;Visible&rdquo; to archive a counselor without deleting them — their profile and any past
        bookings stay intact, they just stop showing up on the site. Lower placement numbers show first.
      </p>
      {counselors.map((c) => (
        <form
          key={c.id}
          action={updateCounselorPlacement}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-white p-5"
        >
          <input type="hidden" name="counselorId" value={c.id} />
          <div>
            <p className="font-display font-semibold text-brand-900">{c.name}</p>
            <p className="text-sm text-ink/60">{c.credentials}</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-ink/70">
              Placement
              <input
                type="number"
                name="sortOrder"
                defaultValue={c.sortOrder}
                className="w-16 rounded-lg border border-brand-200 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-ink/80">
              <input
                type="checkbox"
                name="active"
                defaultChecked={c.active}
                className="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-400"
              />
              Visible
            </label>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Save
            </button>
          </div>
        </form>
      ))}
    </div>
  );
}
