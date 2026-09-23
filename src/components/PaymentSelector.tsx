"use client";

import { useState } from "react";
import { formatEGP } from "@/lib/format";
import { useCurrency } from "@/lib/currency-context";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function PaymentSelector({
  amountEGP,
  getOrderId,
  onRedirect,
  endpoint = "/api/checkout/paymob",
  idField = "orderId",
  disabled = false,
  dict,
}: {
  amountEGP: number;
  /**
   * Resolves to the record id to pay for (creating it first if needed) plus
   * its access token, or null on failure. Returned together, not as two
   * separate props, so a component creating the order right here (rather
   * than already having both from an earlier page load) can't end up
   * sending a stale token from a previous render's props/state.
   */
  getOrderId: () => Promise<{ id: string; accessToken: string } | null>;
  /**
   * Called right before redirecting to the Paymob checkout page — e.g. to
   * clear a cart. Deliberately NOT called just for creating the order, so
   * a failed gateway request leaves the page (and cart) intact to retry.
   */
  onRedirect?: () => void;
  /** Paymob intention route to call — defaults to the shop checkout route. */
  endpoint?: string;
  /** JSON body key the resolved id is sent under — defaults to "orderId". */
  idField?: string;
  /** Holds both buttons inactive — the calling page uses this while a
   * pending Turnstile check (see turnstile-widget.tsx) hasn't produced a
   * token yet, so a click here can't trigger getOrderId() with an empty
   * one. */
  disabled?: boolean;
  dict: Dictionary["paymentSelector"];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { formatConverted } = useCurrency();
  const displayAmount = formatConverted(amountEGP) ?? formatEGP(amountEGP);

  async function handlePay() {
    setLoading(true);
    setError(null);

    const resolved = await getOrderId();
    if (!resolved) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [idField]: resolved.id, accessToken: resolved.accessToken }),
      });
      const data = await res.json();

      if (data.url) {
        onRedirect?.();
        window.location.href = data.url;
      } else {
        setError(data.error || dict.cardUnavailable);
        setLoading(false);
      }
    } catch {
      setError(dict.networkError);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handlePay}
        disabled={loading || disabled}
        className="w-full rounded bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-600 active:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] active:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] disabled:opacity-60"
      >
        {loading ? dict.connecting : dict.checkoutNow.replace("{amount}", displayAmount)}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
