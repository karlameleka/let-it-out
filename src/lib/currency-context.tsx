"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { convertFromEGP, currencyForCountry } from "@/lib/content/currency";

type CurrencyContextValue = {
  country: string | null;
  hydrated: boolean;
  setCountry: (country: string) => void;
  /** Returns a formatted "≈ 20 USD" string, or null if no conversion applies. */
  formatConverted: (egpAmount: number) => string | null;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "lio_country";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Reading localStorage after mount (rather than as a lazy initial
    // state) is intentional: it keeps the server-rendered and first
    // client render both empty, avoiding a hydration mismatch.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setCountryState(stored);
    setHydrated(true);
  }, []);

  const setCountry = useCallback((value: string) => {
    setCountryState(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  }, []);

  const formatConverted = useCallback(
    (egpAmount: number) => {
      if (!country) return null;
      const currencyCode = currencyForCountry(country);
      if (!currencyCode || currencyCode === "EGP") return null;
      const converted = convertFromEGP(egpAmount, currencyCode);
      if (converted === null) return null;
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: currencyCode,
          maximumFractionDigits: converted < 10 ? 2 : 0,
        }).format(converted);
      } catch {
        return null;
      }
    },
    [country],
  );

  const value = useMemo(
    () => ({ country, hydrated, setCountry, formatConverted }),
    [country, hydrated, setCountry, formatConverted],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
