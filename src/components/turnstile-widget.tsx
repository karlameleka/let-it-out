"use client";

import Script from "next/script";

/**
 * Cloudflare Turnstile — free, usually-invisible CAPTCHA (a small badge, no
 * checkbox, for the overwhelming majority of real visitors; an interactive
 * challenge only appears for traffic Cloudflare flags as suspicious).
 * Dropped into every public lead-capturing form alongside the honeypot
 * field and server-side rate limiting.
 *
 * Renders nothing at all when NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set, so
 * forms keep working before Turnstile is configured in the Cloudflare
 * dashboard — matches how the server-side check in anti-spam.ts also
 * no-ops until TURNSTILE_SECRET_KEY is set. Uses Turnstile's implicit
 * rendering (the script scans the page for `.cf-turnstile` on load), so no
 * manual widget-lifecycle JS is needed here. On submit, the form's
 * `cf-turnstile-response` field carries the token the server verifies.
 */
export default function TurnstileWidget({ theme = "auto" }: { theme?: "auto" | "light" | "dark" }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
      <div className="cf-turnstile" data-sitekey={siteKey} data-size="flexible" data-theme={theme} />
    </>
  );
}
