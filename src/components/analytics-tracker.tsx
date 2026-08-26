"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { logPageView } from "@/lib/pageview-actions";

/** Fires a best-effort pageview log on mount and every route change —
 * powers the admin analytics page's feature-usage and time-spent numbers.
 * Only ever mounted for logged-in users (see layout.tsx), so anonymous
 * marketing-site browsing is never tracked. Renders nothing. */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastLogged = useRef<string | null>(null);

  useEffect(() => {
    if (lastLogged.current === pathname) return;
    lastLogged.current = pathname;
    logPageView(pathname).catch(() => {});
  }, [pathname]);

  return null;
}
