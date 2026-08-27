import { prisma } from "@/lib/db";
import { createEvent, deleteEvent } from "@/lib/event-actions";

const RSVP_LABELS: Record<string, string> = {
  ATTENDING: "Attending",
  MAYBE: "Maybe",
  NOT_ATTENDING: "Not attending",
};

function RSVPSummary({ rsvps }: { rsvps: { status: string; user: { name: string } }[] }) {
  if (rsvps.length === 0) {
    return <p className="mt-2 text-xs text-ink/40">No responses yet.</p>;
  }
  const counts = { ATTENDING: 0, MAYBE: 0, NOT_ATTENDING: 0 } as Record<string, number>;
  for (const r of rsvps) counts[r.status] = (counts[r.status] ?? 0) + 1;

  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-brand-700">
        {counts.ATTENDING} attending · {counts.MAYBE} maybe · {counts.NOT_ATTENDING} not attending
      </p>
      <p className="mt-1 text-xs text-ink/50">
        {rsvps.map((r) => `${r.user.name} (${RSVP_LABELS[r.status] ?? r.status})`).join(", ")}
      </p>
    </div>
  );
}

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startAt: "asc" },
    include: { rsvps: { include: { user: { select: { name: true } } } } },
  });
  const today = new Date();
  const upcoming = events.filter((e) => e.startAt >= today);
  const past = events.filter((e) => e.startAt < today).reverse();

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-display font-semibold text-brand-900">New event</h2>
        <p className="mt-1 text-sm text-ink/60">
          Shown to every logged-in client in the notification bell on the site header.
        </p>
        <form action={createEvent} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="title">Title (English)</label>
            <input
              id="title"
              name="title"
              required
              placeholder="e.g. Stress Management Workshop"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="titleAr">Title (Arabic, optional)</label>
            <input
              id="titleAr"
              name="titleAr"
              dir="rtl"
              placeholder="مثال: ورشة إدارة الضغط النفسي"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
            <p className="mt-1 text-[11px] text-ink/40">Shown to clients on the Arabic site — falls back to the English title if left blank.</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              required
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="time">Time</label>
            <input
              id="time"
              name="time"
              type="time"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="location">Location (optional)</label>
            <input
              id="location"
              name="location"
              placeholder="e.g. Online, or the office address"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="meetingLink">Online session link (optional)</label>
            <input
              id="meetingLink"
              name="meetingLink"
              type="url"
              placeholder="e.g. https://meet.google.com/..."
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
            <p className="mt-1 text-[11px] text-ink/40">Only shown to clients who RSVP &ldquo;attending&rdquo;.</p>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="description">Description (English, optional)</label>
            <textarea
              id="description"
              name="description"
              rows={2}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="descriptionAr">Description (Arabic, optional)</label>
            <textarea
              id="descriptionAr"
              name="descriptionAr"
              dir="rtl"
              rows={2}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
            <p className="mt-1 text-[11px] text-ink/40">Falls back to the English description if left blank.</p>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Add event
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="font-display font-semibold text-brand-900">
          Upcoming <span className="text-sm font-normal text-ink/40">({upcoming.length})</span>
        </h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">No upcoming events yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {upcoming.map((e) => (
              <div
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium text-brand-900">{e.title}</p>
                  <p className="text-xs text-ink/50">
                    {e.startAt.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                  {e.description && <p className="mt-1 text-xs text-ink/60">{e.description}</p>}
                  {e.meetingLink && (
                    <a
                      href={e.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs font-medium text-brand-600 link-grow"
                    >
                      {e.meetingLink}
                    </a>
                  )}
                  <RSVPSummary rsvps={e.rsvps} />
                </div>
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit" className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-brand-900">Past</h2>
          <div className="mt-3 space-y-2">
            {past.slice(0, 10).map((e) => (
              <div
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-white px-4 py-3 opacity-70"
              >
                <div>
                  <p className="font-medium text-brand-900">{e.title}</p>
                  <p className="text-xs text-ink/50">
                    {e.startAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </div>
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit" className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
