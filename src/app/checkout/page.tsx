"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { createOrder } from "@/lib/order-actions";
import { Container, Button, ButtonLink } from "@/components/ui";
import { formatEGP } from "@/lib/format";

const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1 block text-sm font-medium text-ink/80";

type PaymentMethod = "INSTAPAY" | "CASH_ON_DELIVERY";

export default function CheckoutPage() {
  const { items, subtotalEGP, clear } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const needsShipping = items.some((i) => i.format === "PHYSICAL");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("INSTAPAY");

  if (items.length === 0) {
    return (
      <Container className="py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-brand-900">Your cart is empty</h1>
        <ButtonLink href="/shop" className="mt-6">Shop journals</ButtonLink>
      </Container>
    );
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await createOrder({
      items: items.map((i) => ({ productVariantId: i.productVariantId, quantity: i.quantity })),
      guestName: String(formData.get("guestName") || ""),
      guestEmail: String(formData.get("guestEmail") || ""),
      guestPhone: String(formData.get("guestPhone") || ""),
      shippingAddress: String(formData.get("shippingAddress") || ""),
      paymentMethod,
    });
    setPending(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    clear();
    router.push(`/orders/${result.orderId}`);
  }

  return (
    <Container className="py-16 sm:py-20">
      <h1 className="font-display text-3xl font-semibold text-brand-900">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <form action={handleSubmit} className="space-y-6 lg:col-span-2">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="guestName">Full name</label>
                <input id="guestName" name="guestName" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="guestEmail">Email</label>
                <input id="guestEmail" name="guestEmail" type="email" required className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="guestPhone">Phone</label>
              <input id="guestPhone" name="guestPhone" type="tel" required className={inputClass} />
            </div>
            {needsShipping && (
              <div>
                <label className={labelClass} htmlFor="shippingAddress">Shipping address</label>
                <textarea id="shippingAddress" name="shippingAddress" rows={3} required className={inputClass} />
                <p className="mt-1 text-xs text-ink/50">
                  Required — your cart includes a physical journal.
                </p>
              </div>
            )}
          </div>

          <div>
            <p className={labelClass}>Payment method</p>
            <div className="space-y-2">
              <PaymentOption
                label="InstaPay"
                description="Pay via InstaPay link, then submit your transaction reference."
                selected={paymentMethod === "INSTAPAY"}
                onSelect={() => setPaymentMethod("INSTAPAY")}
              />
              <PaymentOption
                label="Cash on Delivery"
                description={
                  needsShipping
                    ? "Pay in cash when your journal is delivered to you."
                    : "Only available for orders that include a physical journal."
                }
                selected={paymentMethod === "CASH_ON_DELIVERY"}
                disabled={!needsShipping}
                onSelect={() => setPaymentMethod("CASH_ON_DELIVERY")}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending
              ? "Placing order…"
              : paymentMethod === "CASH_ON_DELIVERY"
                ? "Place order"
                : "Continue to payment"}
          </Button>
        </form>

        <div className="rounded-2xl border-2 border-brand-100 bg-white p-6 h-fit">
          <h2 className="font-display font-semibold text-brand-900">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.productVariantId} className="flex justify-between text-sm">
                <span className="text-ink/70">
                  {item.title} ({item.format === "PHYSICAL" ? "Physical" : "Ebook"}) × {item.quantity}
                </span>
                <span className="font-medium">{formatEGP(item.priceEGP * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-brand-100 pt-4 text-sm font-semibold">
            <span>Total</span>
            <span>{formatEGP(subtotalEGP)}</span>
          </div>
        </div>
      </div>
    </Container>
  );
}

function PaymentOption({
  label,
  description,
  selected,
  disabled,
  onSelect,
}: {
  label: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        selected ? "border-brand-600 bg-brand-50" : "border-brand-100 hover:border-brand-300"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "border-brand-600" : "border-brand-300"
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-brand-600" />}
      </span>
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="block text-xs text-ink/60">{description}</span>
      </span>
    </button>
  );
}
