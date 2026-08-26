import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-edge";
import { THERAPIST_SESSION_COOKIE, verifyTherapistSessionToken } from "@/lib/therapist-session-edge";

// /therapist/login, /forgot-password, /reset-password stay public — every
// other /therapist route is the gated portal.
const PUBLIC_THERAPIST_PATHS = ["/therapist/login", "/therapist/forgot-password", "/therapist/reset-password"];

/**
 * Sets a strict, nonce-based Content-Security-Policy on every page request.
 * `middleware.ts` was renamed to `proxy.ts` in Next.js 16 — same mechanism.
 *
 * script-src uses 'strict-dynamic' + a per-request nonce: Next's own
 * framework/page scripts get the nonce automatically (see
 * app/getting-started/proxy in the Next docs), and 'strict-dynamic' lets
 * those trusted scripts load further scripts without needing to allowlist
 * every third-party script origin by hand. The trailing `'unsafe-inline'
 * https:` on script-src is the standard strict-CSP backward-compat
 * fallback (see Google's strict-CSP guide): browsers new enough to
 * understand 'nonce-'/'strict-dynamic' ignore both tokens per the CSP3
 * spec, so this changes nothing for them — it only keeps script loading
 * from silently breaking on older browsers that don't understand
 * strict-dynamic, which would otherwise see an empty allowlist.
 *
 * style-src allows 'unsafe-inline': several components use React inline
 * `style={{...}}` (mood colors, animation delays) which nonces can't cover
 * — only <style> elements, not the style="" attribute. This is the
 * standard, widely-used tradeoff for CSP in real apps: script injection is
 * the dangerous case and stays strict; inline style injection is a much
 * lower-severity risk.
 *
 * This also carries a defense-in-depth admin-role check for /admin: the
 * `admin/layout.tsx` Server Component already redirects non-admins away
 * from every admin page, but a layout only protects the React page tree —
 * it does nothing for a future route.ts (API handler) added under /admin
 * that forgets to call requireAdmin() itself. Running the same role check
 * here, at the edge, before any admin route (page or API) executes, closes
 * that gap regardless of what gets added later.
 *
 * Trusted Types is added as `Content-Security-Policy-Report-Only`, not in
 * the enforced policy above: it's a separate header, so this reports DOM
 * XSS-sink violations (dangerouslySetInnerHTML aside, we have none in our
 * own code, but React/Next internals or a future third-party script could
 * still trip it) to the browser console without blocking anything. Once a
 * production traffic period shows no violations, promote
 * `require-trusted-types-for 'script'; trusted-types default` into the
 * enforced cspHeader below to actually block DOM-based XSS sinks.
 */
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (
    request.nextUrl.pathname.startsWith("/therapist") &&
    !PUBLIC_THERAPIST_PATHS.some((p) => request.nextUrl.pathname.startsWith(p))
  ) {
    const token = request.cookies.get(THERAPIST_SESSION_COOKIE)?.value;
    const session = token ? await verifyTherapistSessionToken(token) : null;
    if (!session) {
      return NextResponse.redirect(new URL("/therapist/login", request.url));
    }
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https:${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self';
    connect-src 'self';
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const trustedTypesReportOnly = "require-trusted-types-for 'script'; trusted-types default";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("Content-Security-Policy-Report-Only", trustedTypesReportOnly);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|svg|webp|ico|webmanifest)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
