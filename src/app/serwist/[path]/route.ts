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
export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
});
