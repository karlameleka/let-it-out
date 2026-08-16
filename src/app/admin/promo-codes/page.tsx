import { prisma } from "@/lib/db";
import { createPromoCode, togglePromoCodeActive, deletePromoCode } from "@/lib/admin-actions";
import { formatEGP } from "@/lib/format";

export default async function AdminPromoCodesPage() {
  const [codes, products, orderStats] = await Promise.all([
    prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
      include: { products: { include: { product: true } } },
    }),
    prisma.product.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.order.groupBy({
      by: ["promoCodeId"],
      where: { promoCodeId: { not: null }, status: { not: "CANCELLED" } },
      _sum: { discountEGP: true, totalEGP: true },
      _count: { _all: true },
    }),
  ]);

  const statsByCode = new Map(
    orderStats.map((s) => [
      s.promoCodeId as string,
      { orders: s._count._all, discountEGP: s._sum.discountEGP ?? 0, revenueEGP: s._sum.totalEGP ?? 0 },
    ])
  );

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-brand-100 bg-white p-5">
        <h2 className="font-display font-semibold text-brand-900">New promo code</h2>
        <form action={createPromoCode} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="code">Code</label>
            <input
              id="code"
              name="code"
              required
              placeholder="e.g. WELCOME20"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm uppercase outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="discountType">Discount type</label>
            <select id="discountType" name="discountType" className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm">
              <option value="PERCENT">Percentage off</option>
              <option value="FIXED">Fixed EGP amount off</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="discountValue">Value</label>
            <input
              id="discountValue"
              name="discountValue"
              type="number"
              min={1}
              required
              placeholder="e.g. 20"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="expiresAt">
              Expires <span className="text-ink/40">(optional)</span>
            </label>
            <input
              id="expiresAt"
              name="expiresAt"
              type="date"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="maxRedemptions">
              Max uses <span className="text-ink/40">(optional)</span>
            </label>
            <input
              id="maxRedemptions"
              name="maxRedemptions"
              type="number"
              min={1}
              placeholder="Unlimited"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="minOrderEGP">
              Minimum order (EGP) <span className="text-ink/40">(optional)</span>
            </label>
            <input
              id="minOrderEGP"
              name="minOrderEGP"
              type="number"
              min={1}
              placeholder="None"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor="productIds">
              Applies to <span className="text-ink/40">(leave nothing selected for every product)</span>
            </label>
            <select
              id="productIds"
              name="productIds"
              multiple
              size={Math.min(4, Math.max(2, products.length))}
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink/40">Cmd/Ctrl-click (or tap and drag on mobile) to select more than one.</p>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="rounded bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)]"
            >
              Create code
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {codes.length === 0 && <p className="text-sm text-ink/60">No promo codes yet.</p>}
        {codes.map((c) => {
          const expired = c.expiresAt ? c.expiresAt < new Date() : false;
          const usedUp = c.maxRedemptions !== null && c.redemptionCount >= c.maxRedemptions;
          const stats = statsByCode.get(c.id);
          return (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-white p-5">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display font-semibold text-brand-900">{c.code}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.active && !expired && !usedUp
                        ? "bg-brand-50 text-brand-700"
                        : "bg-ink/5 text-ink/40"
                    }`}
                  >
                    {!c.active ? "Disabled" : expired ? "Expired" : usedUp ? "Fully redeemed" : "Active"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink/60">
                  {c.discountType === "PERCENT" ? `${c.discountValue}% off` : `${formatEGP(c.discountValue)} off`}
                  {c.minOrderEGP ? ` · min. order ${formatEGP(c.minOrderEGP)}` : ""}
                  {c.expiresAt ? ` · expires ${c.expiresAt.toLocaleDateString("en-GB")}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-ink/40">
                  Used {c.redemptionCount}{c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""} time{c.redemptionCount === 1 ? "" : "s"}
                  {" · "}
                  {c.products.length === 0 ? "All products" : c.products.map((p) => p.product.title).join(", ")}
                </p>
                <p className="mt-1.5 text-xs font-medium text-brand-700">
                  {stats
                    ? `${stats.orders} paid order${stats.orders === 1 ? "" : "s"} · ${formatEGP(stats.discountEGP)} discounted · ${formatEGP(stats.revenueEGP)} revenue`
                    : "No completed orders yet"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={togglePromoCodeActive}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="active" value={String(c.active)} />
                  <button type="submit" className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50">
                    {c.active ? "Disable" : "Enable"}
                  </button>
                </form>
                <form action={deletePromoCode}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
