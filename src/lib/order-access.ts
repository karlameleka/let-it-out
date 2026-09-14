import "server-only";
import crypto from "crypto";

/**
 * Ownership check for guest checkout confirmation pages (/orders/[id],
 * /counseling/session/[id]) and the retry-payment/submit-reference actions
 * on them. An Order/SessionBooking id is a Prisma cuid() — collision-
 * resistant, but not a cryptographically random secret — so it isn't a safe
 * substitute for a real access check on its own. These rows also carry a
 * hashed random token (accessTokenHash), generated once at creation
 * (createOrder / createSessionBooking) and handed to the browser that
 * placed the order as a query-string "token" — the same pattern as this
 * app's password-reset/intake tokens, just carried in a URL instead of an
 * email link since it needs to survive a payment-gateway redirect round trip.
 *
 * `storedHash` is null only for rows created before this field existed —
 * those fall back to the old id-only behavior rather than being locked out
 * by a migration that can't retroactively hand out tokens to browsers that
 * already navigated away.
 */
export function verifyOrderAccessToken(providedToken: string | null | undefined, storedHash: string | null): boolean {
  if (!storedHash) return true;
  if (!providedToken) return false;
  return hashOrderAccessToken(providedToken) === storedHash;
}

export function generateOrderAccessToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString("hex");
  return { rawToken, tokenHash: hashOrderAccessToken(rawToken) };
}

function hashOrderAccessToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
