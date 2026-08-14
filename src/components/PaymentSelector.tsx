"use client";

import { useState } from "react";
import { formatEGP } from "@/lib/format";

export default function PaymentSelector({
  amountEGP,
  getOrderId,
  onRedirect,
}: {
  amountEGP: number;
  /** Resolves to the Order id to pay for (creating it first if needed), or null on failure. */
  getOrderId: () => Promise<string | null>;
  /**
   * Called right before redirecting to the Paymob checkout page — e.g. to
   * clear a cart. Deliberately NOT called just for creating the order, so
   * a failed gateway request leaves the page (and cart) intact to retry.
   */
  onRedirect?: () => void;
}) {
  const [loading, setLoading] = useState<"card" | "wallet" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(paymentMethod: "card" | "wallet") {
    setLoading(paymentMethod);
    setError(null);

    const orderId = await getOrderId();
    if (!orderId) {
      setLoading(null);
      return;
    }

    try {
      const res = await fetch("/api/checkout/paymob", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentMethod }),
      });
      const data = await res.json();

      if (data.url) {
        onRedirect?.();
        window.location.href = data.url;
      } else {
        setError(data.error || "Card payment isn't available right now.");
        setLoading(null);
      }
    } catch {
      setError("Network error reaching the payment gateway.");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => handlePay("card")}
        disabled={loading !== null}
        className="w-full rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-600 disabled:opacity-60"
      >
        {loading === "card" ? "Connecting to gateway…" : `Pay ${formatEGP(amountEGP)} with Card`}
      </button>
      <button
        type="button"
        onClick={() => handlePay("wallet")}
        disabled={loading !== null}
        className="w-full rounded-full border-2 border-brand-700 px-5 py-3 text-sm font-semibold text-brand-700 transition-all hover:bg-brand-50 disabled:opacity-60"
      >
        {loading === "wallet" ? "Connecting to gateway…" : `Pay ${formatEGP(amountEGP)} with Mobile Wallet`}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
