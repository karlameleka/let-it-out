"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { Container, ButtonLink, Button } from "@/components/ui";
import { formatEGP } from "@/lib/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotalEGP } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <Container className="py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-brand-900">Your cart is empty</h1>
        <p className="mt-2 text-ink/60">Browse our guided journals to get started.</p>
        <ButtonLink href="/shop" className="mt-6">
          Shop journals
        </ButtonLink>
      </Container>
    );
  }

  return (
    <Container className="py-16 sm:py-20">
      <h1 className="font-display text-3xl font-semibold text-brand-900">Your cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.productVariantId}
              className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-4"
            >
              <div className="flex-1">
                <Link href={`/shop/${item.productSlug}`} className="font-display font-semibold text-brand-800 hover:underline">
                  {item.title}
                </Link>
                <p className="text-sm text-ink/50">
                  {formatEGP(item.priceEGP)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productVariantId, item.quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-200 text-ink/70 hover:bg-brand-50"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productVariantId, item.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-200 text-ink/70 hover:bg-brand-50"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <p className="w-24 text-right font-medium text-ink/80">
                {formatEGP(item.priceEGP * item.quantity)}
              </p>

              <button
                type="button"
                onClick={() => removeItem(item.productVariantId)}
                className="text-ink/40 hover:text-brand-500"
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-6 h-fit">
          <div className="flex justify-between text-sm text-ink/70">
            <span>Subtotal</span>
            <span className="font-semibold text-ink">{formatEGP(subtotalEGP)}</span>
          </div>
          <p className="mt-1 text-xs text-ink/50">Shipping (physical items) arranged after order confirmation.</p>
          <Button className="mt-6 w-full" onClick={() => router.push("/checkout")}>
            Checkout
          </Button>
        </div>
      </div>
    </Container>
  );
}
