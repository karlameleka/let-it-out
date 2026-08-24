import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const SECURITY_HEADERS = [
  // Content-Security-Policy is set per-request (with a nonce) in proxy.ts,
  // not here — everything below is static and applies to every response.
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()",
  },
  // Only meaningful over HTTPS (production); harmless on local http dev.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = withSerwist({
  poweredByHeader: false,
  // Detects connectivity loss on navigation/prefetch/Server Action requests
  // and retries automatically once the connection returns, instead of
  // throwing — see the OfflineBanner in layout.tsx and the useOffline()
  // usage it's built on.
  experimental: {
    useOffline: true,
  },
  // Every <Image> then requests its raw /public path directly instead of a
  // dynamically-generated /_next/image?... variant. The service worker
  // precaches every file under public/ by default (counselor photos,
  // product covers, brand marks) — routing images through the raw path is
  // what makes those precached files actually the ones the page requests,
  // so pictures are available offline from a fresh install, not only after
  // being viewed once online.
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },
});

export default nextConfig;
