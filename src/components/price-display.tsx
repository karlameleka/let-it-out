"use client";

import { formatEGP } from "@/lib/format";
import { useCurrency } from "@/lib/currency-context";

/** Shows a price in the visitor's local currency once they've picked a
 * non-Egypt country (at signup or via the country picker), falling back to
 * EGP otherwise. Never shows both — Paymob still charges the exact EGP
 * amount regardless of what's displayed here. */
export default function PriceDisplay({
  egpAmount,
  className,
}: {
  egpAmount: number;
  className?: string;
}) {
  const { formatConverted } = useCurrency();
  const converted = formatConverted(egpAmount);

  return <span className={className}>{converted ?? formatEGP(egpAmount)}</span>;
}
