import "server-only";
import { SignJWT, importPKCS8 } from "jose";

export type AppleOAuthConfig = {
  /** The Services ID registered in Apple Developer, used as OAuth client_id. */
  clientId: string;
  teamId: string;
  keyId: string;
  /** PEM contents of the .p8 private key from a "Sign in with Apple" key. */
  privateKey: string;
};

/**
 * "Sign in with Apple" stays dark until real credentials are supplied,
 * matching how Google sign-in (and other optional integrations) degrade
 * in this codebase. To enable it:
 *
 *   1. In the Apple Developer portal (developer.apple.com/account),
 *      register an App ID with the "Sign in with Apple" capability, then
 *      create a Services ID for this site — its identifier is the OAuth
 *      client_id.
 *   2. On that Services ID, configure "Sign in with Apple" with:
 *        Domains and Subdomains: <your-production-domain>
 *        Return URLs: https://<your-production-domain>/api/auth/apple/callback
 *      Apple requires HTTPS here — there's no HTTP localhost allowance
 *      like Google's, so this can only be tested against a real domain.
 *   3. Under Keys, create a new key with "Sign in with Apple" enabled,
 *      download the .p8 file once (Apple won't let you download it
 *      again), and note its Key ID and your Team ID (top-right of the
 *      developer portal).
 *   4. Set these in the environment (.env locally, your host's project
 *      env vars in production):
 *        APPLE_CLIENT_ID    — the Services ID identifier
 *        APPLE_TEAM_ID      — your Apple Developer Team ID
 *        APPLE_KEY_ID       — the Sign in with Apple key's Key ID
 *        APPLE_PRIVATE_KEY  — the full contents of the .p8 file. If your
 *                             host's env var UI can't store real
 *                             newlines, paste it with literal "\n"
 *                             sequences — they're unescaped below.
 *
 * Until all four are set, getAppleOAuthConfig() returns null and the
 * "Continue with Apple" button is hidden from the login/signup pages.
 */
export function getAppleOAuthConfig(): AppleOAuthConfig | null {
  const clientId = process.env.APPLE_CLIENT_ID;
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const rawPrivateKey = process.env.APPLE_PRIVATE_KEY;
  if (!clientId || !teamId || !keyId || !rawPrivateKey) return null;
  return { clientId, teamId, keyId, privateKey: rawPrivateKey.replace(/\\n/g, "\n") };
}

export function isAppleSignInEnabled(): boolean {
  return getAppleOAuthConfig() !== null;
}

/**
 * Apple's OAuth "client_secret" isn't a static value like Google's — it's
 * a short-lived ES256 JWT signed with the private key from your Sign in
 * with Apple key, asserting your Team ID/Services ID. Generated fresh for
 * each token exchange rather than cached, since it costs nothing to sign
 * and avoids ever holding an unnecessarily long-lived token in memory.
 */
export async function generateAppleClientSecret(config: AppleOAuthConfig): Promise<string> {
  const key = await importPKCS8(config.privateKey, "ES256");
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: config.keyId })
    .setIssuer(config.teamId)
    .setIssuedAt()
    .setExpirationTime("5m")
    .setAudience("https://appleid.apple.com")
    .setSubject(config.clientId)
    .sign(key);
}
