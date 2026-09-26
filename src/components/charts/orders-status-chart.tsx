"use client";

import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";
import type { StatusCount } from "@/lib/dashboard-metrics";

// The validated categorical palette's first six slots (see
// dataviz skill palette.md) — one per order status, in the fixed
// documented order so a status's color never shifts when the mix of
// statuses present changes.
const STATUS_COLOR: Record<string, string> = {
  PENDING_PAYMENT: "#2a78d6",
  PAYMENT_SUBMITTED: "#eb6834",
  CONFIRMED: "#1baf7a",
  SHIPPED: "#eda100",
  COMPLETED: "#e87ba4",
  CANCELLED: "#008300",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Pending payment",
  PAYMENT_SUBMITTED: "Payment submitted",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function TooltipContent({ active, payload }: { active?: boolean; payload?: { payload: StatusCount }[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const { status, count } = payload[0].payload;
  return (
    <div className="rounded-xl border border-brand-100 bg-white p-3 text-xs shadow-lg">
      <p className="font-medium text-ink/80">{STATUS_LABEL[status] ?? status}</p>
      <p className="mt-1 text-ink/60">
        {count} order{count === 1 ? "" : "s"}
      </p>
      <p className="mt-1 text-ink/35">Click to view in Orders</p>
    </div>
  );
}

/** Order-status funnel for the selected range — clicking a bar drills down
 * into the Orders tab pre-filtered to that status, rather than just
 * displaying a static count. */
export default function OrdersStatusChart({ data }: { data: StatusCount[] }) {
  const router = useRouter();

  if (data.every((d) => d.count === 0)) {
    return <p className="flex h-64 items-center justify-center text-sm text-ink/45">No orders in this range yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
        <XAxis
          dataKey="status"
          tickFormatter={(s: string) => STATUS_LABEL[s] ?? s}
          tick={{ fontSize: 10, fill: "#12354399" }}
          axisLine={{ stroke: "#c3c2b7" }}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "#12354399" }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip content={<TooltipContent />} cursor={{ fill: "#eff6f8" }} />
        <Bar
          dataKey="count"
          radius={[4, 4, 0, 0]}
          cursor="pointer"
          onClick={(entry: unknown) => {
            const status = (entry as { status?: string } | undefined)?.status;
            if (status) router.push(`/admin/orders?status=${status}`);
          }}
        >
          {data.map((d) => (
            <Cell key={d.status} fill={STATUS_COLOR[d.status] ?? "#2a78d6"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
