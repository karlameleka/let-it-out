import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session";
import { createLead } from "@/lib/leads";
import { sendWelcomeEmail } from "@/lib/email";
import { getGoogleOAuthConfig } from "@/lib/google-auth";

const STATE_COOKIE = "lio_google_oauth_state";

type GoogleProfile = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
};

export async function GET(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const config = getGoogleOAuthConfig();
  if (!config) {
    loginUrl.searchParams.set("error", "google_not_configured");
    return NextResponse.redirect(loginUrl);
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    loginUrl.searchParams.set("error", "google_auth_failed");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  try {
    const redirectUri = new URL("/api/auth/google/callback", request.url).toString();

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) throw new Error("Google token exchange failed");
    const tokens: { access_token: string } = await tokenRes.json();

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileRes.ok) throw new Error("Google profile fetch failed");
    const profile: GoogleProfile = await profileRes.json();

    if (!profile.email || !profile.email_verified) {
      loginUrl.searchParams.set("error", "google_email_unverified");
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(STATE_COOKIE);
      return response;
    }

    let user = await prisma.user.findUnique({ where: { googleId: profile.sub } });
    let isNewUser = false;

    if (!user) {
      const existingByEmail = await prisma.user.findUnique({ where: { email: profile.email } });
      if (existingByEmail) {
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { googleId: profile.sub },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name ?? profile.email.split("@")[0],
            googleId: profile.sub,
          },
        });
        isNewUser = true;
      }
    }

    if (isNewUser) {
      await createLead({
        name: user.name,
        type: "ACCOUNT_SIGNUP",
        email: user.email,
        source: "Website",
        notes: "Signed up via Google.",
      });
      const baseUrl = new URL(request.url).origin;
      await sendWelcomeEmail({ to: user.email, name: user.name, privacyUrl: `${baseUrl}/privacy` });
    }

    await createSession({ userId: user.id, email: user.email, name: user.name, role: user.role });

    const response = NextResponse.redirect(new URL(user.role === "ADMIN" ? "/admin" : "/journal", request.url));
    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch {
    loginUrl.searchParams.set("error", "google_auth_failed");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(STATE_COOKIE);
    return response;
  }
}
