import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCounselor } from "@/lib/therapist-session";
import { getOwnCounselorWithBookings, deriveClients, deriveAppointments, todayISO } from "@/lib/therapist-data";
import { formatEGP } from "@/lib/format";
import StatusBadge from "../status-badge";

const AVAILABILITY_LABEL: Record<string, string> = {
  AVAILABLE: "Bookable now",
  WAITLIST: "Showing a waitlist badge",
  UNAVAILABLE: "Showing unavailable",
};

export default async function TherapistOverviewPage() {
  const session = await requireCounselor();
  const counselor = await getOwnCounselorWithBookings(session.counselorId);
  if (!counselor) notFound();

  const clients = deriveClients(counselor);
  const appointments = deriveAppointments(counselor);
  const today = todayISO();
  const upcoming = appointments.filter((a) => a.date >= today && a.status !== "CANCELLED");
  const needsAction = appointments.filter((a) => a.kind === "Session request" && a.status === "PENDING");
  const thisMonth = today.slice(0, 7);
  const sessionsThisMonth = appointments.filter((a) => a.date.startsWith(thisMonth)).length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Clients" value={clients.length} />
        <StatCard label="Upcoming" value={upcoming.length} />
        <StatCard label="This month" value={sessionsThisMonth} />
        <StatCard label="Need a reply" value={needsAction.length} accent={needsAction.length > 0} />
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display font-semibold text-brand-900">Price &amp; availability</h2>
          <Link href="/therapist/profile" className="text-sm font-medium text-brand-600 link-grow">
            Edit
          </Link>
        </div>
        <p className="mt-2 text-sm text-ink/60">
          {counselor.priceEGP ? `${formatEGP(counselor.priceEGP)} per session` : "No session price set"}
          {" · "}
          {AVAILABILITY_LABEL[counselor.availabilityStatus]}
        </p>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display font-semibold text-brand-900">Next up</h2>
          <Link href="/therapist/calendar" className="text-sm font-medium text-brand-600 link-grow">
            View calendar
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">No upcoming sessions on the books.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {upcoming.slice(0, 5).map((a) => (
              <div
                key={`${a.kind}-${a.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium text-brand-900">{a.name}</p>
                  <p className="text-xs text-ink/50">
                    {a.kind} · {a.date}
                    {a.time ? ` at ${a.time}` : ""}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {needsAction.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-brand-900">Waiting on a reply</h2>
          <div className="mt-3 space-y-2">
            {needsAction.slice(0, 5).map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div>
                  <p className="font-medium text-brand-900">{a.name}</p>
                  <p className="text-xs text-ink/50">Requested {a.date} at {a.time}</p>
                </div>
                <Link href="/therapist/clients" className="text-xs font-semibold text-brand-600 link-grow">
                  Respond →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "border-amber-300 bg-amber-50" : "border-brand-100 bg-white"}`}>
      <p className="font-display text-2xl font-semibold leading-none text-brand-900">{value}</p>
      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink/40">{label}</p>
    </div>
  );
}
