"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCurrency } from "@/lib/currency-context";
import { COUNTRIES } from "@/lib/content/geo";

export default function CountryPickerModal() {
  const pathname = usePathname();
  const { country, hydrated, setCountry } = useCurrency();
  const [selected, setSelected] = useState("Egypt");
  const [dismissed, setDismissed] = useState(false);

  if (pathname?.startsWith("/admin")) return null;
  if (!hydrated || country !== null || dismissed) return null;

  function confirm() {
    setCountry(selected);
  }

  function skip() {
    setDismissed(true);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm animate-pop-in overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-2xl">
        <div className="bg-brand-700 px-6 py-5 text-white">
          <h2 className="font-display text-lg font-semibold">
            Welcome to Let It Out
          </h2>
          <p className="mt-1 text-sm text-brand-100/80">
            Choose your country so we can show prices in your currency.
          </p>
        </div>
        <div className="px-6 py-5">
          <label className="mb-1 block text-sm font-medium text-ink/80" htmlFor="entry-country">
            Country
          </label>
          <select
            id="entry-country"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <p className="mt-2 text-xs text-ink/45">
            Prices shown in your currency are approximate. You&apos;ll always
            pay the exact Egyptian Pound (EGP) amount.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={confirm}
              className="flex-1 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold tracking-tight text-white shadow-sm shadow-brand-800/20 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-400 hover:shadow-md hover:shadow-brand-800/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={skip}
              className="shrink-0 text-sm font-medium text-ink/50 hover:text-ink/70"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
