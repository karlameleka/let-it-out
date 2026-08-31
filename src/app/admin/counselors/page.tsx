import Link from "next/link";
import { prisma } from "@/lib/db";
import { updateCounselorPlacement, deleteCounselor } from "@/lib/admin-actions";
import ConfirmSubmitButton from "@/components/confirm-submit-button";

export default async function AdminCounselorsPage() {
  const counselors = await prisma.counselor.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: {
          sessionBookings: true,
          bookingRequests: true,
          intakeSubmissions: true,
          clientNotes: true,
          assignedResources: true,
          referralsSent: true,
          referralsReceived: true,
        },
      },
    },
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink/60">
        Uncheck &ldquo;Visible&rdquo; to archive a counselor without deleting them — their profile and any past
        bookings stay intact, they just stop showing up on the site. Lower placement numbers show first. Email
        is notified alongside the admin inbox on every counseling inquiry/booking for that counselor.
      </p>
      {counselors.map((c) => {
        const hasHistory =
          c._count.sessionBookings +
            c._count.bookingRequests +
            c._count.intakeSubmissions +
            c._count.clientNotes +
            c._count.assignedResources +
            c._count.referralsSent +
            c._count.referralsReceived >
          0;

        return (
          <div key={c.id} className="rounded-2xl border border-brand-100 bg-white p-5">
            <form
              action={updateCounselorPlacement}
              className="flex flex-wrap items-center justify-between gap-4"
            >
              <input type="hidden" name="counselorId" value={c.id} />
              <div>
                <Link
                  href={`/admin/counselors/${c.id}`}
                  className="font-display font-semibold text-brand-900 underline-offset-2 hover:underline"
                >
                  {c.name}
                </Link>
                <p className="text-sm text-ink/60">{c.credentials}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-ink/70">
                  Email
                  <input
                    type="email"
                    name="email"
                    defaultValue={c.email ?? ""}
                    placeholder="Not set"
                    className="w-48 rounded-lg border border-brand-200 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
                  />
                </label>
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
            <div className="mt-3 border-t border-brand-50 pt-3">
              {hasHistory ? (
                <p className="text-xs text-ink/40">
                  Has booking, session, or client history — can&rsquo;t be deleted. Uncheck &ldquo;Visible&rdquo;
                  above to archive instead.
                </p>
              ) : (
                <form action={deleteCounselor}>
                  <input type="hidden" name="counselorId" value={c.id} />
                  <ConfirmSubmitButton
                    confirmMessage={`Delete ${c.name}? This removes their profile permanently and immediately ends their therapist portal access. They have no booking history yet, so nothing else is affected.`}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete counselor
                  </ConfirmSubmitButton>
                </form>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
