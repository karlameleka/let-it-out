import { prisma } from "@/lib/db";
import { updateOrderStatus } from "@/lib/admin-actions";
import { formatEGP } from "@/lib/format";

const STATUSES = ["PENDING_PAYMENT", "PAYMENT_SUBMITTED", "CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"];

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="space-y-4">
      {orders.length === 0 && <p className="text-sm text-ink/60">No orders yet.</p>}
      {orders.map((order) => (
        <div key={order.id} className="rounded-2xl border border-brand-100 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-display font-semibold text-brand-800">
                #{order.id.slice(-8).toUpperCase()} · {order.guestName}
              </p>
              <p className="text-sm text-ink/60">{order.guestEmail} · {order.guestPhone}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                  {order.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "InstaPay"}
                </span>
                <p className="text-xs text-ink/40">
                  {order.createdAt.toLocaleString("en-GB")}
                </p>
              </div>
            </div>
            <p className="font-display text-lg font-semibold text-brand-800">
              {formatEGP(order.totalEGP)}
            </p>
          </div>

          <ul className="mt-3 space-y-1 text-sm text-ink/70">
            {order.items.map((i) => (
              <li key={i.id}>
                {i.titleSnapshot} × {i.quantity}
              </li>
            ))}
          </ul>

          {order.needsShipping && order.shippingAddress && (
            <div className="mt-2 space-y-1 text-sm text-ink/60">
              <p>
                Ship to: {order.shippingAddress}
                {order.governorate ? `, ${order.governorate}` : ""}
                {order.country ? `, ${order.country}` : ""}
              </p>
              {order.googleMapsLink && (
                <p>
                  <a
                    href={order.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-600 underline"
                  >
                    Google Maps location
                  </a>
                </p>
              )}
              <p>
                Shipping fee:{" "}
                {order.country === "Egypt"
                  ? formatEGP(order.shippingFeeEGP)
                  : "Calculated upon delivery"}
              </p>
            </div>
          )}
          {order.paymentRef && (
            <p className="mt-2 text-sm text-ink/60">
              Payment ref: <span className="font-medium text-ink/80">{order.paymentRef}</span>
              {order.paymentNote && ` — ${order.paymentNote}`}
            </p>
          )}

          <form action={updateOrderStatus} className="mt-4 flex items-center gap-2">
            <input type="hidden" name="orderId" value={order.id} />
            <select
              name="status"
              defaultValue={order.status}
              className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
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
