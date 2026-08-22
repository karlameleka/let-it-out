"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { createOrder, checkPromoCode, type CreateOrderInput } from "@/lib/order-actions";
import { Container, Button, ButtonLink } from "@/components/ui";
import { formatEGP } from "@/lib/format";
import { COUNTRIES, EGYPT_GOVERNORATES } from "@/lib/content/geo";
import { EGYPT_SHIPPING_FEE_EGP } from "@/lib/shipping";
import PriceDisplay from "@/components/price-display";
import PaymentSelector from "@/components/PaymentSelector";

const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1 block text-sm font-medium text-ink/80";

type PaymentMethod = "CASH_ON_DELIVERY" | "PAYMOB";
type Account = { name: string; email: string; phone: string | null; country: string | null };

export default function CheckoutForm({ account }: { account: Account | null }) {
  const { items, subtotalEGP, clear } = useCart();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [country, setCountry] = useState(account?.country ?? "");
  const [useAccount, setUseAccount] = useState(!!account);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH_ON_DELIVERY");
  const [paymobOrderId, setPaymobOrderId] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; discountEGP: number; label: string } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoChecking, setPromoChecking] = useState(false);

  const needsShipping = items.some((i) => i.format === "PHYSICAL");
  const isEgypt = country === "Egypt";
  const shippingCalculatedOnDelivery = needsShipping && country !== "" && !isEgypt;
  const shippingFeeEGP = needsShipping && isEgypt ? EGYPT_SHIPPING_FEE_EGP : 0;
  const discountEGP = promoApplied?.discountEGP ?? 0;
  const totalEGP = subtotalEGP - discountEGP + shippingFeeEGP;

  async function applyPromoCode() {
    if (!promoInput.trim()) return;
    setPromoChecking(true);
    setPromoError(null);
    const result = await checkPromoCode(
      promoInput,
      items.map((i) => ({ productSlug: i.productSlug, priceEGP: i.priceEGP, quantity: i.quantity })),
    );
    setPromoChecking(false);
    if (!result.valid) {
      setPromoError(result.error);
      setPromoApplied(null);
      return;
    }
    setPromoApplied({ code: result.code, discountEGP: result.discountEGP, label: result.label });
  }

  function removePromoCode() {
    setPromoApplied(null);
    setPromoInput("");
    setPromoError(null);
  }

  if (items.length === 0) {
    return (
      <Container className="pt-8 pb-14 text-center sm:pt-14 sm:pb-20">
        <h1 className="font-display text-2xl font-semibold text-brand-900">Your cart is empty</h1>
        <ButtonLink href="/shop" className="mt-6">Shop journals</ButtonLink>
      </Container>
    );
  }

  function buildOrderInput(method: PaymentMethod): CreateOrderInput | null {
    if (!formRef.current || !formRef.current.reportValidity()) return null;
    const formData = new FormData(formRef.current);
    return {
      items: items.map((i) => ({ productVariantId: i.productVariantId, quantity: i.quantity })),
      guestName: String(formData.get("guestName") || ""),
      guestEmail: String(formData.get("guestEmail") || ""),
      guestPhone: String(formData.get("guestPhone") || ""),
      shippingAddress: String(formData.get("shippingAddress") || ""),
      googleMapsLink: String(formData.get("googleMapsLink") || ""),
      country: String(formData.get("country") || ""),
      governorate: String(formData.get("governorate") || ""),
      paymentMethod: method,
      promoCode: promoApplied?.code,
    };
  }

  async function handleCodSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input = buildOrderInput("CASH_ON_DELIVERY");
    if (!input) return;

    setPending(true);
    setError(null);
    const result = await createOrder(input);
    setPending(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    clear();
    router.push(`/orders/${result.orderId}`);
  }

  async function handleCreatePaymobOrder(): Promise<string | null> {
    // Reuse the order from an earlier attempt on this page (e.g. after a
    // gateway hiccup) instead of creating a duplicate pending order.
    if (paymobOrderId) return paymobOrderId;

    setError(null);
    const input = buildOrderInput("PAYMOB");
    if (!input) return null;

    const result = await createOrder(input);
    if ("error" in result) {
      setError(result.error);
      return null;
    }

    // Don't clear the cart yet — only once we're actually about to redirect
    // to Paymob (see onRedirect below). If the gateway call fails, the
    // order already exists but the cart and this page should stay intact.
    setPaymobOrderId(result.orderId);
    return result.orderId;
  }

  return (
    <Container className="pt-6 pb-10 sm:pt-14 sm:pb-20">
      <h1 className="font-display text-3xl font-medium text-brand-900">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <form ref={formRef} onSubmit={handleCodSubmit} className="space-y-6 lg:col-span-2">
          <div className="space-y-4">
            {account && (
              <div className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink/70">
                    {useAccount ? (
                      <>
                        Ordering as <span className="font-medium text-ink/90">{account.name}</span> · {account.email}
                        {account.phone ? ` · ${account.phone}` : ""}
                      </>
                    ) : (
                      "Entering details manually"
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUseAccount((v) => !v)}
                    className="shrink-0 text-xs font-medium text-brand-600 link-grow"
                  >
                    {useAccount ? "Not you?" : "Use my details"}
                  </button>
                </div>
                {useAccount && (
                  <>
                    <input type="hidden" name="guestName" value={account.name} />
                    <input type="hidden" name="guestEmail" value={account.email} />
                    {account.phone && <input type="hidden" name="guestPhone" value={account.phone} />}
                  </>
                )}
              </div>
            )}
            {(!account || !useAccount) && (
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
            )}
            {(!account || !useAccount || !account.phone) && (
              <div>
                <label className={labelClass} htmlFor="guestPhone">Phone</label>
                <input id="guestPhone" name="guestPhone" type="tel" required className={inputClass} />
              </div>
            )}
            {needsShipping && (
              <>
                <div>
                  <label className={labelClass} htmlFor="shippingAddress">Shipping address</label>
                  <textarea id="shippingAddress" name="shippingAddress" rows={3} required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass} htmlFor="googleMapsLink">
                    Google Maps link <span className="font-normal text-ink/40">(optional)</span>
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
            <div className="rounded-xl border-2 border-brand-100 bg-brand-50 px-4 py-3 text-sm text-ink/70">
              <span className="font-semibold text-brand-800">Shipping —</span>{" "}
              {isEgypt
                ? `flat ${formatEGP(EGYPT_SHIPPING_FEE_EGP)} anywhere in Egypt.`
                : shippingCalculatedOnDelivery
                  ? "calculated upon delivery outside Egypt."
                  : "select your country to see the fee."}
            </div>
          )}

          <div>
            <p className={labelClass}>Payment method</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
                  paymentMethod === "CASH_ON_DELIVERY" ? "border-brand-500 bg-brand-50" : "border-brand-100"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethodChoice"
                  className="mt-1"
                  checked={paymentMethod === "CASH_ON_DELIVERY"}
                  onChange={() => setPaymentMethod("CASH_ON_DELIVERY")}
                />
                <span>
                  <span className="block text-sm font-semibold text-brand-800">Cash on Delivery</span>
                  <span className="mt-0.5 block text-xs text-ink/60">Pay in cash on arrival.</span>
                </span>
              </label>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
                  paymentMethod === "PAYMOB" ? "border-brand-500 bg-brand-50" : "border-brand-100"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethodChoice"
                  className="mt-1"
                  checked={paymentMethod === "PAYMOB"}
                  onChange={() => setPaymentMethod("PAYMOB")}
                />
                <span>
                  <span className="block text-sm font-semibold text-brand-800">Card / Mobile Wallet</span>
                  <span className="mt-0.5 block text-xs text-ink/60">Pay online — cards and Apple Pay.</span>
                </span>
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {paymentMethod === "CASH_ON_DELIVERY" ? (
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Placing order…" : "Place order"}
            </Button>
          ) : (
            <PaymentSelector amountEGP={totalEGP} getOrderId={handleCreatePaymobOrder} onRedirect={clear} />
          )}
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
          <div className="mt-4 border-t border-brand-100 pt-4">
            {promoApplied ? (
              <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm">
                <span className="font-medium text-brand-800">
                  &ldquo;{promoApplied.code}&rdquo; applied — {promoApplied.label}
                </span>
                <button
                  type="button"
                  onClick={removePromoCode}
                  className="text-xs font-medium text-ink/50 hover:text-ink/70 active:text-ink/70"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code"
                    className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm uppercase tracking-wide outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={applyPromoCode}
                    disabled={promoChecking || !promoInput.trim()}
                    className="shrink-0 rounded-lg border-[1.5px] border-brand-200 px-3 py-2 text-sm font-medium text-brand-700 transition-colors disabled:opacity-50 hover:border-brand-400 active:border-brand-400 hover:bg-brand-50 active:bg-brand-50"
                  >
                    {promoChecking ? "Checking…" : "Apply"}
                  </button>
                </div>
                {promoError && <p className="mt-1.5 text-xs text-red-600">{promoError}</p>}
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2 border-t border-brand-100 pt-4 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatEGP(subtotalEGP)}</span>
            </div>
            {discountEGP > 0 && (
              <div className="flex justify-between text-brand-700">
                <span>Discount</span>
                <span>-{formatEGP(discountEGP)}</span>
              </div>
            )}
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
              <span><PriceDisplay egpAmount={totalEGP} /></span>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
