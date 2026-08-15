import { prisma } from "@/lib/db";
import { updateVariantStock } from "@/lib/admin-actions";
import { formatEGP } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { sortOrder: "asc" },
    include: { variants: true },
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink/60">
        Set a stock number for physical journals. Leave it blank for unlimited/untracked (that&apos;s the
        default for ebooks). The shop shows &ldquo;Only N left&rdquo; at 5 or fewer, and blocks purchase at 0.
      </p>
      {products.map((product) => (
        <div key={product.id} className="rounded-2xl border border-brand-100 bg-white p-5">
          <p className="font-display font-semibold text-brand-900">{product.title}</p>
          <div className="mt-3 space-y-3">
            {product.variants.map((v) => (
              <form
                key={v.id}
                action={updateVariantStock}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3"
              >
                <input type="hidden" name="variantId" value={v.id} />
                <div>
                  <p className="text-sm font-medium text-ink/80">
                    {v.format === "PHYSICAL" ? "Physical copy" : "Ebook"} · {formatEGP(v.priceEGP)}
                  </p>
                  <p className="text-xs text-ink/40">SKU {v.sku}</p>
                </div>
                {v.format === "PHYSICAL" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="stockCount"
                      min={0}
                      defaultValue={v.stockCount ?? ""}
                      placeholder="Unlimited"
                      className="w-28 rounded-lg border border-brand-200 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                    >
                      Update
                    </button>
                    {v.stockCount === 0 && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">Out of stock</span>
                    )}
                    {v.stockCount !== null && v.stockCount > 0 && v.stockCount <= 5 && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Only {v.stockCount} left
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-ink/40">Digital — no inventory to track</span>
                )}
              </form>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
