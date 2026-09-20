// Same content as /privacy in the main app, single-sourced — this just
// lets it render standalone under the marketing site's own header/footer
// (src/app/site/layout.tsx) instead of the PWA chrome, so it's reachable
// from the apex marketing domain without linking into the app.
export { default, metadata } from "@/app/privacy/page";
