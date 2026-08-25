import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCounselor } from "@/lib/therapist-session";
import { getOwnCounselorWithBookings, deriveAppointments, todayISO } from "@/lib/therapist-data";
import { prisma } from "@/lib/db";
import StatusBadge from "../../status-badge";
import AvailabilityManager from "./availability-manager";
import AppointmentsCalendar from "./appointments-calendar";

export default async function TherapistCalendarPage() {
  const session = await requireCounselor();
  const [counselor, availabilityWindows] = await Promise.all([
    getOwnCounselorWithBookings(session.counselorId),
    prisma.counselorAvailability.findMany({ where: { counselorId: session.counselorId } }),
  ]);
  if (!counselor) notFound();

  const appointments = deriveAppointments(counselor).filter((a) => a.status !== "CANCELLED");
  const today = todayISO();
  const upcoming = appointments.filter((a) => a.date >= today);
  const past = appointments.filter((a) => a.date < today).reverse();

  return (
    <div className="space-y-8">
      <AvailabilityManager windows={availabilityWindows} />

      <div>
        <h2 className="font-display font-semibold text-brand-900">Upcoming</h2>
        <div className="mt-3">
          <AppointmentsCalendar upcoming={upcoming} />
        </div>
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
