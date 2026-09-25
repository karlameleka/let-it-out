import type { NextRequest } from "next/server";
import { createSerwistRoute } from "@serwist/turbopack";

// Page-level precaching (marketing/resources pages fetched and cached up
// front, at SW install time, so they're readable offline even on a first
// visit) was removed: every one of those pages renders through RootLayout,
// which bakes in the visitor's locale (header, footer, bottom nav, `html
// lang`/`dir`) at the moment the page was cached. Because a precache match
// is served straight from that frozen snapshot — bypassing sw.ts's
// runtimeCaching rules entirely — switching to Arabic could leave the
// bottom nav and page chrome stuck in English (or vice versa) on any of
// these routes until the next deploy rebuilt the cache. Build-asset
// precaching (JS/CSS chunks, not locale-sensitive) still happens
// automatically via createSerwistRoute; page HTML now always goes through
// sw.ts's runtime NetworkFirst/NetworkOnly handling instead, which reads
// the current locale cookie on every fetch.
export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET: serwistGET } = createSerwistRoute({
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
});

// createSerwistRoute() doesn't set a Cache-Control header, so this fell back
// to Next's own default for a force-static route handler: `s-maxage=31536000`
// (one year) with no revalidation directive at all. A service worker script
// must never be cached like a normal static asset — every browser is
// supposed to bypass its HTTP cache when checking sw.js for updates, but
// that check itself still depends on actually being allowed to revalidate,
// and Safari in particular (the only engine on iOS, where this app is
// installed as a home-screen PWA) has a long, well-documented history of
// getting stuck on a cached response with no explicit no-cache/no-store
// directive — which is indistinguishable from the app never picking up a
// fix, ever, for that install, since skipWaiting/clientsClaim in sw.ts can't
// help if the browser never re-fetches sw.js to see it changed. A fresh
// "Add to Home Screen" has no cached response yet, so it always looked
// fine — exactly the symptom reported. `no-cache` still allows caching but
// forces revalidation on every request, which is the standard, explicitly
// recommended header for this exact file (see Workbox's and MDN's service
// worker lifecycle docs).
export async function GET(request: NextRequest, ctx: { params: Promise<{ path: string }> }) {
  const response = await serwistGET(request, ctx);
  response.headers.set("Cache-Control", "no-cache");
  return response;
}
