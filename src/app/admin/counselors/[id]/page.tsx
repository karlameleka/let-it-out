import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatEGP } from "@/lib/format";
import { updateCounselorDetails, deleteCounselorClient } from "@/lib/admin-actions";
import ConfirmSubmitButton from "@/components/confirm-submit-button";

const AVAILABILITY_OPTIONS = [
  { value: "AVAILABLE", label: "Available" },
  { value: "WAITLIST", label: "Waitlist" },
  { value: "UNAVAILABLE", label: "Unavailable" },
] as const;

function countByStatus<T extends string>(rows: { status: T }[]) {
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.status] = (counts[row.status] ?? 0) + 1;
  return counts;
}

export default async function AdminCounselorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const counselor = await prisma.counselor.findUnique({
    where: { id },
    include: {
      sessionBookings: { orderBy: { createdAt: "desc" } },
      bookingRequests: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!counselor) notFound();

  const sessionCounts = countByStatus(counselor.sessionBookings);
  const requestCounts = countByStatus(counselor.bookingRequests);

  const clientsByEmail = new Map<string, { name: string; email: string; phone: string; lastContact: Date }>();
  for (const row of [...counselor.sessionBookings, ...counselor.bookingRequests]) {
    const existing = clientsByEmail.get(row.email);
    if (!existing || row.createdAt > existing.lastContact) {
      clientsByEmail.set(row.email, {
        name: row.name,
        email: row.email,
        phone: row.phone,
        lastContact: row.createdAt,
      });
    }
  }
  const clients = [...clientsByEmail.values()].sort(
    (a, b) => b.lastContact.getTime() - a.lastContact.getTime()
  );

  return (
    <div className="space-y-6">
      <Link href="/admin/counselors" className="text-sm font-medium text-brand-600 underline">
        ← Back to counselors
      </Link>

      <div className="flex flex-wrap items-start gap-5 rounded-2xl border border-brand-100 bg-white p-6">
        {counselor.photoUrl && (
          <Image
            src={counselor.photoUrl}
            alt={counselor.name}
            width={80}
            height={80}
            className="h-20 w-20 rounded-full object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-semibold text-brand-900">{counselor.name}</h1>
            {!counselor.active && (
              <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs font-medium text-ink/50">Archived</span>
            )}
          </div>
          <p className="text-sm text-ink/60">{counselor.credentials}</p>
          <p className="mt-2 max-w-2xl whitespace-pre-line text-sm text-ink/70">{counselor.bio}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {counselor.specialties.map((s) => (
              <span key={s} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                {s}
              </span>
            ))}
          </div>
          {counselor.languages.length > 0 && (
            <p className="mt-2 text-sm text-ink/60">Languages: {counselor.languages.join(", ")}</p>
          )}
          <p className="mt-1 text-sm text-ink/60">
            Notification email: {counselor.email ?? <span className="text-ink/40">Not set</span>}
          </p>
        </div>
        {counselor.bookingUrl && (
          <a
            href={counselor.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Open Cal.com dashboard →
          </a>
        )}
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-display font-semibold text-brand-900">Price &amp; availability</h2>
        <p className="mt-1 text-sm text-ink/60">
          Controls what visitors see and whether the booking form is live on this counselor&rsquo;s public page.
        </p>
        <form action={updateCounselorDetails} className="mt-4 flex flex-wrap items-end gap-4">
          <input type="hidden" name="counselorId" value={counselor.id} />
          <label className="text-sm text-ink/70">
            <span className="mb-1 block font-medium text-ink/80">Session price (EGP)</span>
            <input
              type="number"
              name="priceEGP"
              min={0}
              defaultValue={counselor.priceEGP ?? ""}
              placeholder="Not set"
              className="w-40 rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </label>
          <label className="text-sm text-ink/70">
            <span className="mb-1 block font-medium text-ink/80">Availability</span>
            <select
              name="availabilityStatus"
              defaultValue={counselor.availabilityStatus}
              className="w-40 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              {AVAILABILITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Save
          </button>
        </form>
        <p className="mt-3 text-xs text-ink/50">
          {counselor.priceEGP ? `Currently: ${formatEGP(counselor.priceEGP)}` : "Currently: no session price set"}
          {" · "}
          {counselor.availabilityStatus === "AVAILABLE"
            ? "Bookable now"
            : counselor.availabilityStatus === "WAITLIST"
              ? "Showing a Waitlist badge, booking hidden"
              : "Showing an Unavailable badge, booking hidden"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-brand-100 bg-white p-5">
          <h2 className="font-display font-semibold text-brand-900">Paid session bookings</h2>
          <p className="mt-1 text-sm text-ink/60">
            {counselor.sessionBookings.length} total
            {Object.entries(sessionCounts).map(([status, count]) => (
              <span key={status}> · {status.replaceAll("_", " ").toLowerCase()}: {count}</span>
            ))}
          </p>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-5">
          <h2 className="font-display font-semibold text-brand-900">Manual booking requests</h2>
          <p className="mt-1 text-sm text-ink/60">
            {counselor.bookingRequests.length} total
            {Object.entries(requestCounts).map(([status, count]) => (
              <span key={status}> · {status.toLowerCase()}: {count}</span>
            ))}
          </p>
        </div>
      </div>

      <div>
        <h2 className="font-display font-semibold text-brand-900">
          Clients <span className="text-sm font-normal text-ink/40">({clients.length})</span>
        </h2>
        {clients.length === 0 ? (
          <p className="mt-2 text-sm text-ink/60">No clients yet.</p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl border border-brand-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-50 text-xs font-semibold uppercase tracking-wide text-brand-700">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Last contact</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.email} className="border-t border-brand-50">
                    <td className="px-5 py-3">{c.name}</td>
                    <td className="px-5 py-3 text-ink/70">{c.email}</td>
                    <td className="px-5 py-3 text-ink/70">{c.phone}</td>
                    <td className="px-5 py-3 text-ink/60">{c.lastContact.toLocaleString("en-GB")}</td>
                    <td className="px-5 py-3 text-right">
                      <form action={deleteCounselorClient}>
                        <input type="hidden" name="counselorId" value={counselor.id} />
                        <input type="hidden" name="email" value={c.email} />
                        <ConfirmSubmitButton
                          confirmMessage={`Delete ${c.name}'s booking history with ${counselor.name}? This removes their booking requests and paid session bookings with this counselor and can't be undone.`}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
