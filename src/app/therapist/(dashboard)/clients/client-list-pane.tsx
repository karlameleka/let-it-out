"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TherapistClient, TherapistCounselorWithBookings } from "@/lib/therapist-data";
import { updateOwnBookingRequestStatus } from "@/lib/therapist-actions";
import StatusBadge from "../../status-badge";

const STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

type BookingRequest = TherapistCounselorWithBookings["bookingRequests"][number];

export default function ClientListPane({
  clients,
  requests,
}: {
  clients: TherapistClient[];
  requests: BookingRequest[];
}) {
  const pathname = usePathname();
  const hasPending = requests.some((r) => r.status === "PENDING");

  return (
    <div className="space-y-4">
      {requests.length > 0 && (
        <details className="rounded-2xl border border-brand-100 bg-white" open={hasPending}>
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
            <span className="font-display text-sm font-semibold text-brand-900">
              Session requests <span className="font-normal text-ink/40">({requests.length})</span>
            </span>
          </summary>
          <div className="space-y-3 border-t border-brand-50 p-4 pt-3">
            {requests.map((r) => (
              <div key={r.id} className="rounded-xl border border-brand-100 bg-brand-50/30 p-3.5">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/therapist/clients/${encodeURIComponent(r.email)}`}
                    className="text-sm font-semibold text-brand-900 underline-offset-2 hover:underline"
                  >
                    {r.name}
                  </Link>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-1 text-xs text-ink/60">
                  {r.sessionType.replaceAll("_", " ")} · Preferred {r.preferredDate} at {r.preferredTime}
                </p>
                {r.message && <p className="mt-1.5 text-xs text-ink/60">&ldquo;{r.message}&rdquo;</p>}
                <form action={updateOwnBookingRequestStatus} className="mt-2.5 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="bookingId" value={r.id} />
                  <select
                    name="status"
                    defaultValue={r.status}
                    className="rounded-lg border border-brand-200 px-2.5 py-1 text-xs outline-none focus:border-brand-500"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700"
                  >
                    Update
                  </button>
                </form>
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="rounded-2xl border border-brand-100 bg-white">
        <div className="border-b border-brand-50 px-4 py-3">
          <h2 className="font-display text-sm font-semibold text-brand-900">
            Clients <span className="font-normal text-ink/40">({clients.length})</span>
          </h2>
        </div>
        {clients.length === 0 ? (
          <p className="p-4 text-sm text-ink/60">No clients yet.</p>
        ) : (
          <ul>
            {clients.map((c) => {
              const href = `/therapist/clients/${encodeURIComponent(c.email)}`;
              const active = pathname === href;
              return (
                <li key={c.email} className="border-t border-brand-50 first:border-t-0">
                  <Link
                    href={href}
                    className={`block border-l-4 px-3.5 py-3 ${
                      active ? "border-brand-600 bg-brand-100" : "border-transparent hover:bg-brand-50/50"
                    }`}
                  >
                    <p className={`text-sm font-medium ${active ? "text-brand-700" : "text-brand-900"}`}>{c.name}</p>
                    <p className="mt-0.5 truncate text-xs text-ink/50">{c.email}</p>
                    <p className="mt-0.5 text-xs text-ink/40">
                      {c.totalBookings} booking{c.totalBookings === 1 ? "" : "s"} · last{" "}
                      {c.lastContact.toLocaleDateString("en-GB")}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
