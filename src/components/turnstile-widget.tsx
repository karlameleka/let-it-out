"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: "auto" | "light" | "dark";
          size?: "flexible" | "normal" | "compact";
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

/**
 * Cloudflare Turnstile — free, usually-invisible CAPTCHA (a small badge, no
 * checkbox, for the overwhelming majority of real visitors; an interactive
 * challenge only appears for traffic Cloudflare flags as suspicious).
 * Dropped into every public lead-capturing form alongside the honeypot
 * field and server-side rate limiting.
 *
 * Explicit render (not implicit `.cf-turnstile` auto-scan): the widget
 * loads and solves its challenge *asynchronously*, after the page is
 * already interactive, so a form that lets someone submit the instant
 * they click "Send" can beat it there and ship an empty
 * `cf-turnstile-response` — which the server-side check in anti-spam.ts
 * then hard-rejects as "couldn't verify you're human", even though
 * nothing about the visitor was actually suspicious. `onReady`/`onError`
 * let the calling form hold its submit button until a real token exists
 * (or fail open if the widget itself couldn't load — a network hiccup or
 * an ad-blocker shouldn't be able to permanently block a real customer;
 * the honeypot + rate limit checks still apply either way).
 *
 * Renders nothing at all when NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set, so
 * forms keep working before Turnstile is configured in the Cloudflare
 * dashboard — matches how the server-side check in anti-spam.ts also
 * no-ops until TURNSTILE_SECRET_KEY is set.
 */
export default function TurnstileWidget({
  theme = "auto",
  onReady,
  onError,
}: {
  theme?: "auto" | "light" | "dark";
  /** Fires once a verification token actually exists. */
  onReady?: () => void;
  /** Fires if the widget fails to load, times out, or its token expires
   * before submit — callers should fail open (not block submission on
   * this alone) rather than strand a real visitor. */
  onError?: () => void;
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!siteKey || !scriptLoaded || !containerRef.current || !window.turnstile) return;
    const turnstile = window.turnstile;
    const container = containerRef.current;

    widgetIdRef.current = turnstile.render(container, {
      sitekey: siteKey,
      theme,
      size: "flexible",
      callback: () => onReady?.(),
      "error-callback": () => onError?.(),
      "expired-callback": () => onError?.(),
      "timeout-callback": () => onError?.(),
    });

    return () => {
      if (widgetIdRef.current) turnstile.remove(widgetIdRef.current);
    };
    // onReady/onError are stable event handlers passed fresh each render in
    // practice, but the widget itself should only ever be rendered once per
    // mount — re-running this on every callback identity change would tear
    // down and rebuild the live Cloudflare widget for no reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, scriptLoaded, theme]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => onError?.()}
      />
      <div ref={containerRef} />
    </>
  );
}
