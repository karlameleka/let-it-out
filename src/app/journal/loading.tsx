"use client";

import { useOffline } from "next/offline";

// Route-level Suspense fallback for every /journal/* page (feed, composer,
// entry detail, history, patterns, reflection). With experimental.useOffline
// on, this is also what Next.js prefetches as the offline-capable "shell"
// for these routes — see node_modules/next/dist/docs/01-app/02-guides/
// offline-support.md. Reads the locale cookie directly (no DB call) rather
// than going through getLocale()/getSiteSettings(), since this fallback
// must never itself depend on the network it may be standing in for.
function readLocaleCookie(): "en" | "ar" {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|; )lio_locale=([^;]*)/);
  return match?.[1] === "ar" ? "ar" : "en";
}

const WAITING_TEXT = {
  en: "Waiting for connection to load your journal…",
  ar: "في انتظار الاتصال لتحميل يومياتك…",
};

export default function JournalLoading() {
  const isOffline = useOffline();
  const locale = readLocaleCookie();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      {isOffline && (
        <p
          dir={locale === "ar" ? "rtl" : "ltr"}
          className="mb-6 text-center text-sm font-medium text-brand-600"
        >
          {WAITING_TEXT[locale]}
        </p>
      )}
      <div className="animate-pulse space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl border-2 border-brand-100 bg-brand-50/60" />
        ))}
      </div>
    </div>
  );
}
