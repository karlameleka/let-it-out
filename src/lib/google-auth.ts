import "server-only";

/**
 * "Sign in with Google" is fully wired but stays dark until real credentials
 * are supplied, matching how other optional integrations degrade in this
 * codebase (e.g. email sending, web push). To enable it:
 *
 *   1. In Google Cloud Console, create an OAuth 2.0 Client ID (Web application).
 *   2. Add these Authorized redirect URIs:
 *        http://localhost:3000/api/auth/google/callback   (local dev)
 *        https://<your-production-domain>/api/auth/google/callback
 *   3. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the environment
 *      (.env locally, Vercel project env vars in production).
 *
 * Until both are set, getGoogleOAuthConfig() returns null and the
 * "Continue with Google" button is hidden from the login/signup pages.
 */
export function getGoogleOAuthConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function isGoogleSignInEnabled(): boolean {
  return getGoogleOAuthConfig() !== null;
}
