import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireCounselor } from "@/lib/therapist-session";
import { getOwnCounselorWithBookings, deriveAppointments, todayISO } from "@/lib/therapist-data";
import StatusBadge from "../../status-badge";

export default async function TherapistCalendarPage() {
  const session = await requireCounselor();
  const counselor = await getOwnCounselorWithBookings(session.counselorId);
  if (!counselor) notFound();

  const appointments = deriveAppointments(counselor).filter((a) => a.status !== "CANCELLED");
  const today = todayISO();
  const upcoming = appointments.filter((a) => a.date >= today);
  const past = appointments.filter((a) => a.date < today).reverse();

  const byDate = new Map<string, typeof upcoming>();
  for (const a of upcoming) {
    byDate.set(a.date, [...(byDate.get(a.date) ?? []), a]);
  }
  const dates = [...byDate.keys()].sort();

  return (
    <div className="space-y-8">
      {counselor.bookingUrl && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-white p-5">
          <div>
            <h2 className="font-display font-semibold text-brand-900">Live scheduling calendar</h2>
            <p className="mt-1 text-sm text-ink/60">
              Exact time slots and your real-time availability live in Cal.com — manage them there. This
              page shows the sessions and requests that have come through this site.
            </p>
          </div>
          <a
            href={counselor.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            Open Cal.com <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
          </a>
        </div>
      )}

      <div>
        <h2 className="font-display font-semibold text-brand-900">Upcoming</h2>
        {dates.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">Nothing scheduled yet.</p>
        ) : (
          <div className="mt-3 space-y-5">
            {dates.map((date) => (
              <div key={date}>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                  {new Date(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <div className="mt-2 space-y-2">
                  {byDate.get(date)!.map((a) => (
                    <Link
                      key={`${a.kind}-${a.id}`}
                      href={`/therapist/clients/${encodeURIComponent(a.email)}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-white px-4 py-3 transition-colors hover:border-brand-300"
                    >
                      <div>
                        <p className="font-medium text-brand-900">{a.name}</p>
                        <p className="text-xs text-ink/50">
                          {a.kind}
                          {a.time ? ` · requested ${a.time}` : ""}
                        </p>
                      </div>
                      <StatusBadge status={a.status} />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-brand-900">Past</h2>
          <div className="mt-3 space-y-2">
            {past.slice(0, 10).map((a) => (
              <Link
                key={`${a.kind}-${a.id}`}
                href={`/therapist/clients/${encodeURIComponent(a.email)}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-white px-4 py-3 opacity-70 transition-colors hover:border-brand-300 hover:opacity-100"
              >
                <div>
                  <p className="font-medium text-brand-900">{a.name}</p>
                  <p className="text-xs text-ink/50">{a.kind} · {a.date}</p>
                </div>
                <StatusBadge status={a.status} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
