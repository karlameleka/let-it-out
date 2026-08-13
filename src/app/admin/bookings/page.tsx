import { prisma } from "@/lib/db";
import { updateBookingStatus } from "@/lib/admin-actions";

const STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

export default async function AdminBookingsPage() {
  const bookings = await prisma.bookingRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { counselor: true },
  });

  return (
    <div className="space-y-4">
      {bookings.length === 0 && <p className="text-sm text-ink/60">No booking requests yet.</p>}
      {bookings.map((b) => (
        <div key={b.id} className="rounded-2xl border border-brand-100 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-display font-semibold text-brand-800">{b.name}</p>
              <p className="text-sm text-ink/60">{b.email} · {b.phone}</p>
              <p className="mt-1 text-sm text-ink/70">
                With <strong>{b.counselor.name}</strong> · {b.sessionType.replaceAll("_", " ")}
              </p>
              <p className="text-sm text-ink/70">
                Preferred: {b.preferredDate} at {b.preferredTime}
              </p>
              {b.message && <p className="mt-2 text-sm text-ink/60">&ldquo;{b.message}&rdquo;</p>}
              <p className="mt-1 text-xs text-ink/40">{b.createdAt.toLocaleString("en-GB")}</p>
            </div>
          </div>

          <form action={updateBookingStatus} className="mt-4 flex items-center gap-2">
            <input type="hidden" name="bookingId" value={b.id} />
            <select
              name="status"
              defaultValue={b.status}
              className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
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
