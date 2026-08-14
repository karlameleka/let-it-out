"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ConsentGate from "@/components/consent-gate";
import CountryPickerModal from "@/components/country-picker-modal";

const STORAGE_KEY = "lio_consent_given";

export default function EntryGates() {
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Reading localStorage after mount (rather than as a lazy initial
    // state) is intentional: it keeps the server-rendered and first
    // client render both empty, avoiding a hydration mismatch.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setConsentGiven(true);
    setHydrated(true);
  }, []);

  function acceptConsent() {
    setConsentGiven(true);
    window.localStorage.setItem(STORAGE_KEY, "1");
  }

  if (pathname?.startsWith("/admin")) return null;
  if (!hydrated) return null;

  // Data-protection consent comes first; only once it's given do we ask
  // for a country (used purely for the informational currency display).
  if (!consentGiven) {
    return <ConsentGate onAccept={acceptConsent} />;
  }

  return <CountryPickerModal />;
}
