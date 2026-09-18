import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { HONEYPOT_FIELD } from "@/lib/anti-spam-shared";

export { HONEYPOT_FIELD };

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 3;

/** Best-effort client IP from the standard proxy headers Vercel sets on
 * every request. Falls back to a fixed string (never null) so callers can
 * always build a rate-limit key — on platforms that don't set these
 * headers, every caller is treated as one shared bucket. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

/**
 * True if this route+IP is still within budget — 3 requests per 10 minutes
 * by default, but callers can pass a stricter (or looser) budget for a
 * specific route via `opts`. Writes a hit row on every allowed call, and
 * opportunistically prunes this key's own rows that have aged out of the
 * window — the table stays roughly proportional to real traffic instead of
 * growing unbounded. Exported directly (not just via screenSubmission) for
 * server actions that don't receive a FormData to run the full honeypot +
 * Turnstile check against — e.g. activateReferral, requestSignupOtp.
 */
export async function checkRateLimit(
  routeKey: string,
  ip: string,
  opts?: { windowMs?: number; max?: number },
): Promise<boolean> {
  const windowMs = opts?.windowMs ?? RATE_LIMIT_WINDOW_MS;
  const max = opts?.max ?? RATE_LIMIT_MAX_REQUESTS;
  const key = `${routeKey}:${ip}`;
  const windowStart = new Date(Date.now() - windowMs);

  const recentCount = await prisma.rateLimitHit.count({
    where: { key, createdAt: { gt: windowStart } },
  });
  if (recentCount >= max) return false;

  await prisma.rateLimitHit.create({ data: { key } });
  await prisma.rateLimitHit.deleteMany({ where: { key, createdAt: { lte: windowStart } } });

  return true;
}

/**
 * Verifies a Cloudflare Turnstile token server-side. Returns true (allow)
 * whenever TURNSTILE_SECRET_KEY isn't configured at all — this is what lets
 * every public form keep working the moment this ships, before Turnstile
 * has actually been set up in the Cloudflare dashboard and its keys added
 * to the environment. Once the secret is set, verification becomes a hard
 * requirement: a missing or invalid token is rejected.
 */
async function verifyTurnstile(token: string | null, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/**
 * Runs every public-form anti-spam check in one place — honeypot, then
 * rate limit, then Turnstile — and is the single thing every unauthenticated
 * lead-capturing server action (contact, workshop interest/inquiry,
 * resource notify, booking request) calls first.
 *
 * `routeKey` scopes the rate limit per form so filling out one doesn't burn
 * another's quota (e.g. "contact", "workshop-interest").
 *
 * Returns null when the submission should proceed normally. Returns a
 * FormState-shaped object to return as-is otherwise: a honeypot hit
 * pretends success (never tips off the bot that it was caught), while a
 * rate-limit or Turnstile/captcha failure surfaces a real, human-readable
 * error.
 *
 * `opts.simpleCaptcha` swaps the Turnstile network round-trip for a check
 * against SimpleCaptcha's captchaAnswer/captchaExpected fields instead —
 * used by the counseling booking forms, where the Turnstile widget's load
 * time produced a visible "Verifying…" wait that a user reported.
 */
export async function screenSubmission(
  formData: FormData,
  routeKey: string,
  opts?: { simpleCaptcha?: boolean },
): Promise<{ error?: string; success?: boolean } | null> {
  if (String(formData.get(HONEYPOT_FIELD) ?? "").trim() !== "") {
    return { success: true };
  }

  const ip = await getClientIp();

  const allowed = await checkRateLimit(routeKey, ip);
  if (!allowed) {
    return { error: "Too many requests. Please try again in a few minutes." };
  }

  if (opts?.simpleCaptcha) {
    const expected = String(formData.get("captchaExpected") ?? "").trim().toUpperCase();
    const answer = String(formData.get("captchaAnswer") ?? "").trim().toUpperCase();
    if (!expected || answer !== expected) {
      return { error: "That code didn't match. Please try again." };
    }
    return null;
  }

  const turnstileToken = String(formData.get("cf-turnstile-response") ?? "").trim() || null;
  const turnstileOk = await verifyTurnstile(turnstileToken, ip);
  if (!turnstileOk) {
    return { error: "We couldn't verify you're human. Please refresh the page and try again." };
  }

  return null;
}
