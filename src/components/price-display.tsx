"use client";

import { formatEGP } from "@/lib/format";
import { useCurrency } from "@/lib/currency-context";

export default function PriceDisplay({
  egpAmount,
  className,
  convertedClassName,
}: {
  egpAmount: number;
  className?: string;
  convertedClassName?: string;
}) {
  const { formatConverted } = useCurrency();
  const converted = formatConverted(egpAmount);

  return (
    <span className={className}>
      {formatEGP(egpAmount)}
      {converted && (
        <span className={convertedClassName ?? "ml-1.5 text-ink/40"}>
          (&asymp; {converted})
        </span>
      )}
    </span>
  );
}
