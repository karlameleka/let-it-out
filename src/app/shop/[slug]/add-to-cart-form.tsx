"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui";
import { formatEGP } from "@/lib/format";

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
  const [formatId, setFormatId] = useState(
    variants.find((v) => v.format === "PHYSICAL")?.id ?? variants[0].id,
  );
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const selected = variants.find((v) => v.id === formatId)!;

  function handleAdd() {
    addItem({
      productVariantId: selected.id,
      productSlug,
      title,
      format: selected.format,
      priceEGP: selected.priceEGP,
      coverImageUrl: null,
    });
    setAdded(true);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-ink/80">Format</p>
        <div className="flex gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                setFormatId(v.id);
                setAdded(false);
              }}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                v.id === formatId
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-brand-200 text-ink/70 hover:border-brand-400"
              }`}
            >
              {v.format === "PHYSICAL" ? "Physical" : "Ebook"} · {formatEGP(v.priceEGP)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={handleAdd}>
          Add to cart
        </Button>
        <Button type="button" variant="outline" onClick={() => { handleAdd(); router.push("/cart"); }}>
          Buy now
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
