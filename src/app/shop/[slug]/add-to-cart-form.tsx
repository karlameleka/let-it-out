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
};

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

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={() => {
            handleAdd();
            router.push("/cart");
          }}
        >
          Buy now
        </Button>
        <Button type="button" variant="outline" onClick={handleAdd}>
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
