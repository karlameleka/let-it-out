import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { deleteClientAccount } from "@/lib/admin-actions";
import { formatEGP } from "@/lib/format";
import ConfirmSubmitButton from "@/components/confirm-submit-button";

const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-50 text-amber-700",
  PAYMENT_SUBMITTED: "bg-amber-50 text-amber-700",
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-brand-50 text-brand-700",
  SHIPPED: "bg-brand-50 text-brand-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] ?? "bg-brand-50 text-brand-700"}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, accountCode: true, createdAt: true, role: true },
  });
  if (!client || client.role !== "USER") notFound();

  const [orders, bookingRequests, sessionBookings] = await Promise.all([
    prisma.order.findMany({
      where: { userId: client.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, totalEGP: true, status: true, createdAt: true },
    }),
    prisma.bookingRequest.findMany({
      where: { userId: client.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, preferredDate: true, preferredTime: true, status: true, createdAt: true, counselor: { select: { name: true } } },
    }),
    prisma.sessionBooking.findMany({
      where: { email: client.email },
      orderBy: { createdAt: "desc" },
      select: { id: true, priceEGP: true, discountEGP: true, status: true, preferredDate: true, createdAt: true, counselor: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/clients" className="text-sm font-medium text-brand-600 hover:underline">
            &larr; All clients
          </Link>
          <h2 className="mt-2 font-display text-2xl font-semibold text-brand-900">{client.name}</h2>
          <p className="mt-1 text-sm text-ink/60">{client.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink/50">
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 font-semibold text-brand-700">{client.accountCode}</span>
            <span>Joined {client.createdAt.toLocaleDateString("en-GB")}</span>
          </div>
        </div>
        <form action={deleteClientAccount}>
          <input type="hidden" name="userId" value={client.id} />
          <ConfirmSubmitButton
            confirmMessage={`Permanently delete ${client.name}'s account (${client.email})? Their journal entries, push subscriptions, and live-chat history are deleted outright; past orders and session requests are kept for our records but no longer linked to them. If they're logged in, they'll be signed out automatically. This can't be undone.`}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            Delete account
          </ConfirmSubmitButton>
        </form>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white">
        <div className="border-b border-brand-50 px-5 py-3">
          <h3 className="font-display font-semibold text-brand-900">Orders ({orders.length})</h3>
        </div>
        {orders.length === 0 ? (
          <p className="px-5 py-4 text-sm text-ink/50">No orders.</p>
        ) : (
          <ul className="divide-y divide-brand-50">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                <span className="font-medium text-ink/80">#{o.id.slice(-8).toUpperCase()}</span>
                <span className="text-ink/50">{o.createdAt.toLocaleDateString("en-GB")}</span>
                <span className="font-medium text-ink/80">{formatEGP(o.totalEGP)}</span>
                <StatusPill status={o.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white">
        <div className="border-b border-brand-50 px-5 py-3">
          <h3 className="font-display font-semibold text-brand-900">Booking requests ({bookingRequests.length})</h3>
        </div>
        {bookingRequests.length === 0 ? (
          <p className="px-5 py-4 text-sm text-ink/50">No booking requests.</p>
        ) : (
          <ul className="divide-y divide-brand-50">
            {bookingRequests.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                <span className="font-medium text-ink/80">{b.counselor.name}</span>
                <span className="text-ink/50">{b.preferredDate} · {b.preferredTime}</span>
                <StatusPill status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white">
        <div className="border-b border-brand-50 px-5 py-3">
          <h3 className="font-display font-semibold text-brand-900">Session bookings ({sessionBookings.length})</h3>
        </div>
        {sessionBookings.length === 0 ? (
          <p className="px-5 py-4 text-sm text-ink/50">No paid sessions.</p>
        ) : (
          <ul className="divide-y divide-brand-50">
            {sessionBookings.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                <span className="font-medium text-ink/80">{s.counselor.name}</span>
                <span className="text-ink/50">{s.preferredDate}</span>
                <span className="font-medium text-ink/80">{formatEGP(s.priceEGP - s.discountEGP)}</span>
                <StatusPill status={s.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
