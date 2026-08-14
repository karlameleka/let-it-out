"use client";

import { useEffect, useId } from "react";

/**
 * Renders Cal.com's official inline embed for a given booking link.
 * `calLink` is everything after "cal.com/", e.g. "verna-awad/50min-session".
 *
 * This mirrors Cal.com's documented embed snippet (a persistent queueing
 * shim that Cal's own embed.js drains once it loads) rather than an npm
 * package, to avoid an extra dependency for a single widget. Each booking
 * made through it uses whatever conferencing location (e.g. Google Meet)
 * the counselor configured for that event type in their Cal.com account —
 * that link is generated and sent by Cal.com itself, not by us.
 */
type CalApi = ((...args: unknown[]) => void) & {
  loaded?: boolean;
  ns?: Record<string, unknown>;
  q?: unknown[][];
};

function getCal(): CalApi {
  const w = window as unknown as { Cal?: CalApi };
  if (w.Cal) return w.Cal;

  const cal: CalApi = ((...args: unknown[]) => {
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q ?? [];
      const script = document.createElement("script");
      script.src = "https://app.cal.com/embed/embed.js";
      script.async = true;
      document.head.appendChild(script);
      cal.loaded = true;
    }
    cal.q!.push(args);
  }) as CalApi;

  w.Cal = cal;
  return cal;
}

export default function CalBooking({ calLink }: { calLink: string }) {
  const containerId = `cal-inline-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const Cal = getCal();
    Cal("init", { origin: "https://cal.com" });
    Cal("inline", {
      elementOrSelector: `#${containerId}`,
      calLink,
      layout: "month_view",
    });
  }, [calLink, containerId]);

  return <div id={containerId} className="min-h-[600px] w-full" />;
}
