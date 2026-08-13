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
              <p className="mt-1 text-xs text-ink/40">
                {order.createdAt.toLocaleString("en-GB")}
              </p>
            </div>
            <p className="font-display text-lg font-semibold text-brand-800">
              {formatEGP(order.totalEGP)}
            </p>
          </div>

          <ul className="mt-3 space-y-1 text-sm text-ink/70">
            {order.items.map((i) => (
              <li key={i.id}>
                {i.titleSnapshot} ({i.formatSnapshot}) × {i.quantity}
              </li>
            ))}
          </ul>

          {order.needsShipping && order.shippingAddress && (
            <p className="mt-2 text-sm text-ink/60">Ship to: {order.shippingAddress}</p>
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
