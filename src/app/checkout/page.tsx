"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { createOrder } from "@/lib/order-actions";
import { Container, Button, ButtonLink } from "@/components/ui";
import { formatEGP } from "@/lib/format";
import { COUNTRIES, EGYPT_GOVERNORATES } from "@/lib/content/geo";
import { EGYPT_SHIPPING_FEE_EGP } from "@/lib/shipping";

const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1 block text-sm font-medium text-ink/80";

export default function CheckoutPage() {
  const { items, subtotalEGP, clear } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [country, setCountry] = useState("");

  const needsShipping = items.some((i) => i.format === "PHYSICAL");
  const isEgypt = country === "Egypt";
  const shippingCalculatedOnDelivery = needsShipping && country !== "" && !isEgypt;
  const shippingFeeEGP = needsShipping && isEgypt ? EGYPT_SHIPPING_FEE_EGP : 0;
  const totalEGP = subtotalEGP + shippingFeeEGP;

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
      googleMapsLink: String(formData.get("googleMapsLink") || ""),
      country: String(formData.get("country") || ""),
      governorate: String(formData.get("governorate") || ""),
      paymentMethod: "CASH_ON_DELIVERY",
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
              <>
                <div>
                  <label className={labelClass} htmlFor="shippingAddress">Shipping address</label>
                  <textarea id="shippingAddress" name="shippingAddress" rows={3} required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="googleMapsLink">
                    Google Maps location link <span className="font-normal text-ink/40">(optional, helps our courier find you)</span>
                  </label>
                  <input
                    id="googleMapsLink"
                    name="googleMapsLink"
                    type="url"
                    placeholder="https://maps.app.goo.gl/…"
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="country">Country</label>
                    <select
                      id="country"
                      name="country"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className={inputClass}
                    >
                      <option value="" disabled>Select your country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  {isEgypt && (
                    <div>
                      <label className={labelClass} htmlFor="governorate">Governorate</label>
                      <select id="governorate" name="governorate" required defaultValue="" className={inputClass}>
                        <option value="" disabled>Select your governorate</option>
                        {EGYPT_GOVERNORATES.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {needsShipping && (
            <div className="rounded-xl border-2 border-brand-100 bg-brand-50 p-4">
              <p className="text-sm font-semibold text-brand-800">Shipping</p>
              <p className="mt-1 text-sm text-ink/60">
                {isEgypt
                  ? `Flat shipping fee of ${formatEGP(EGYPT_SHIPPING_FEE_EGP)} anywhere in Egypt.`
                  : shippingCalculatedOnDelivery
                    ? "Shipping outside Egypt is calculated upon delivery."
                    : "Select your country to see shipping details."}
              </p>
            </div>
          )}

          <div className="rounded-xl border-2 border-brand-100 bg-brand-50 p-4">
            <p className="text-sm font-semibold text-brand-800">Cash on Delivery</p>
            <p className="mt-1 text-sm text-ink/60">
              No payment needed now — pay in cash when your journal is
              delivered to you.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Placing order…" : "Place order"}
          </Button>
        </form>

        <div className="rounded-2xl border-2 border-brand-100 bg-white p-6 h-fit">
          <h2 className="font-display font-semibold text-brand-900">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.productVariantId} className="flex justify-between text-sm">
                <span className="text-ink/70">
                  {item.title} × {item.quantity}
                </span>
                <span className="font-medium">{formatEGP(item.priceEGP * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-brand-100 pt-4 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatEGP(subtotalEGP)}</span>
            </div>
            {needsShipping && (
              <div className="flex justify-between text-ink/70">
                <span>Shipping</span>
                <span>
                  {isEgypt
                    ? formatEGP(shippingFeeEGP)
                    : shippingCalculatedOnDelivery
                      ? "On delivery"
                      : "—"}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-brand-100 pt-2 font-semibold">
              <span>Total</span>
              <span>{formatEGP(totalEGP)}</span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
