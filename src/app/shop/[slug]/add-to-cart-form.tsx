"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui";
import PriceDisplay from "@/components/price-display";

type Variant = {
  id: string;
  format: "PHYSICAL" | "EBOOK";
  priceEGP: number;
  stockCount: number | null;
};

const LOW_STOCK_THRESHOLD = 5;

export default function AddToCartForm({
  productSlug,
  title,
  variants,
}: {
  productSlug: string;
  title: string;
  variants: Variant[];
}) {
  const variant = variants[0];
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const outOfStock = variant.stockCount === 0;
  const lowStock = variant.stockCount !== null && variant.stockCount > 0 && variant.stockCount <= LOW_STOCK_THRESHOLD;

  function handleAdd() {
    addItem({
      productVariantId: variant.id,
      productSlug,
      title,
      format: variant.format,
      priceEGP: variant.priceEGP,
      coverImageUrl: null,
    });
    setAdded(true);
  }

  return (
    <div className="space-y-5">
      <p className="font-display text-2xl font-semibold text-brand-900">
        <PriceDisplay egpAmount={variant.priceEGP} />
      </p>

      {outOfStock ? (
        <p className="inline-flex items-center rounded-full bg-ink/5 px-3 py-1 text-sm font-medium text-ink/50">
          Out of stock
        </p>
      ) : lowStock ? (
        <p className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
          Only {variant.stockCount} left
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={outOfStock}
          onClick={() => {
            handleAdd();
            router.push("/cart");
          }}
        >
          {outOfStock ? "Out of stock" : "Buy now"}
        </Button>
        <Button type="button" variant="outline" disabled={outOfStock} onClick={handleAdd}>
          Add to cart
        </Button>
      </div>

      {added && (
        <p className="text-sm font-medium text-brand-600">
          Added to cart. <a href="/cart" className="underline">View cart &rarr;</a>
        </p>
      )}
    </div>
  );
}
