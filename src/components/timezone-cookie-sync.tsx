"use client";

import { useEffect } from "react";

// Kept as a literal string (matching the lio_locale pattern in
// src/app/journal/loading.tsx) since the server-only TIMEZONE_COOKIE
// constant in src/lib/timezone.ts can't be imported from a client component.
const COOKIE_NAME = "lio_tz";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Reports the visitor's actual device timezone to the server via a cookie,
 * so every server-side "what day is it" computation (the signup age gate,
 * admin demographics) can use the visitor's real local day instead of the
 * server's own UTC day. Booking/cancel-window logic deliberately does NOT
 * use this — a counselor's availability is a real-world Cairo calendar,
 * the same for every visitor regardless of where they're browsing from —
 * see CAIRO_TIME_ZONE in src/lib/timezone.ts.
 *
 * Runs once per mount and only writes the cookie when the detected zone
 * differs from what's already stored, so this is a no-op on every
 * subsequent page load once it's settled.
 */
export default function TimezoneCookieSync() {
  useEffect(() => {
    let timeZone: string;
    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return;
    }
    if (!timeZone) return;

    const match = document.cookie.match(/(?:^|; )lio_tz=([^;]*)/);
    const current = match ? decodeURIComponent(match[1]) : null;
    if (current === timeZone) return;

    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(timeZone)}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
  }, []);

  return null;
}
