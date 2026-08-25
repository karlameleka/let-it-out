import { notFound } from "next/navigation";
import { requireCounselor } from "@/lib/therapist-session";
import { getOwnCounselorWithBookings, deriveClients } from "@/lib/therapist-data";
import { updateOwnBookingRequestStatus } from "@/lib/therapist-actions";
import StatusBadge from "../../status-badge";

const STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

export default async function TherapistClientsPage() {
  const session = await requireCounselor();
  const counselor = await getOwnCounselorWithBookings(session.counselorId);
  if (!counselor) notFound();

  const clients = deriveClients(counselor);
  const requests = [...counselor.bookingRequests].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display font-semibold text-brand-900">
          Clients <span className="text-sm font-normal text-ink/40">({clients.length})</span>
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          Everyone who has booked or requested a session with you, most recent first.
        </p>
        {clients.length === 0 ? (
          <p className="mt-4 text-sm text-ink/60">No clients yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-50 text-xs font-semibold uppercase tracking-wide text-brand-700">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Bookings</th>
                  <th className="px-5 py-3">Last contact</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.email} className="border-t border-brand-50">
                    <td className="px-5 py-3 font-medium text-brand-900">{c.name}</td>
                    <td className="px-5 py-3 text-ink/70">{c.email}</td>
                    <td className="px-5 py-3 text-ink/70">{c.phone}</td>
                    <td className="px-5 py-3 text-ink/70">{c.totalBookings}</td>
                    <td className="px-5 py-3 text-ink/60">{c.lastContact.toLocaleDateString("en-GB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display font-semibold text-brand-900">
          Session requests <span className="text-sm font-normal text-ink/40">({requests.length})</span>
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          Manual requests from clients booking without Cal.com — update the status once you&rsquo;ve been
          in touch.
        </p>
        {requests.length === 0 ? (
          <p className="mt-4 text-sm text-ink/60">No session requests yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="rounded-2xl border border-brand-100 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display font-semibold text-brand-900">{r.name}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm text-ink/60">{r.email} · {r.phone}</p>
                    <p className="mt-1 text-sm text-ink/70">
                      {r.sessionType.replaceAll("_", " ")} · Preferred {r.preferredDate} at {r.preferredTime}
                    </p>
                    {r.message && <p className="mt-2 text-sm text-ink/60">&ldquo;{r.message}&rdquo;</p>}
                  </div>
                </div>
                <form action={updateOwnBookingRequestStatus} className="mt-3 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="bookingId" value={r.id} />
                  <select
                    name="status"
                    defaultValue={r.status}
                    className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
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
        )}
      </div>
    </div>
  );
}
