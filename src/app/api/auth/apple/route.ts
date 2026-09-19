import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAppleOAuthConfig } from "@/lib/apple-auth";

const STATE_COOKIE = "lio_apple_oauth_state";

export async function GET(request: NextRequest) {
  const config = getAppleOAuthConfig();
  if (!config) {
    return NextResponse.redirect(new URL("/login?error=apple_not_configured", request.url));
  }

  const state = crypto.randomBytes(24).toString("hex");
  const redirectUri = new URL("/api/auth/apple/callback", request.url).toString();

  const authUrl = new URL("https://appleid.apple.com/auth/authorize");
  authUrl.searchParams.set("client_id", config.clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  // Requesting the "name"/"email" scopes requires form_post — Apple posts
  // the result back to our callback rather than appending a query string.
  authUrl.searchParams.set("response_mode", "form_post");
  authUrl.searchParams.set("scope", "name email");
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    // The callback arrives as a cross-site POST from appleid.apple.com —
    // a SameSite=Lax cookie (fine for Google's GET-based redirect back)
    // would be dropped on that POST, so this needs None+Secure instead.
    // Apple also requires an HTTPS redirect URI outright, so there's no
    // insecure-localhost case to fall back to here.
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 600,
  });
  return response;
}
