"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { Button, focusRing, motionEase } from "@/components/ui";
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
    <div className="space-y-6">
      <p className="font-display text-3xl font-semibold tracking-tight text-brand-900">
        <PriceDisplay egpAmount={variant.priceEGP} convertedClassName="ml-2 text-lg text-ink-faint" />
      </p>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          size="lg"
          onClick={() => {
            handleAdd();
            router.push("/cart");
          }}
        >
          Buy now
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={handleAdd}>
          Add to cart
        </Button>
      </div>

      {added && (
        <p
          role="status"
          className="animate-pop-in rounded-2xl border border-brand-900/10 bg-brand-50/70 px-4 py-3 text-sm font-medium text-brand-700 backdrop-blur-sm"
        >
          Added to cart.{" "}
          <Link
            href="/cart"
            className={`link-grow rounded-md font-semibold ${motionEase} ${focusRing}`}
          >
            View cart &rarr;
          </Link>
        </p>
      )}
    </div>
  );
}
