import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session";
import { createLead } from "@/lib/leads";
import { sendWelcomeEmail } from "@/lib/email";
import { getAppleOAuthConfig, generateAppleClientSecret } from "@/lib/apple-auth";
import { getLocale } from "@/lib/i18n/locale";

const STATE_COOKIE = "lio_apple_oauth_state";

const APPLE_JWKS = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

/** Only present in the POST body the very first time someone ever
 * authorizes this Services ID — Apple never sends it again on later
 * sign-ins, so it has to be captured now or not at all. */
function parseAppleUserName(rawUserField: string | null): string | undefined {
  if (!rawUserField) return undefined;
  try {
    const parsed = JSON.parse(rawUserField) as { name?: { firstName?: string; lastName?: string } };
    const name = [parsed.name?.firstName, parsed.name?.lastName].filter(Boolean).join(" ").trim();
    return name || undefined;
  } catch {
    return undefined;
  }
}

// Apple posts here as a same-origin form submission (response_mode=form_post)
// rather than a GET redirect with a query string, so this has to be a POST
// handler — and every redirect below must use 303 rather than the default
// 307, or the browser would preserve the POST method onto /login.
export async function POST(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const config = getAppleOAuthConfig();
  if (!config) {
    loginUrl.searchParams.set("error", "apple_not_configured");
    return NextResponse.redirect(loginUrl, 303);
  }

  const formData = await request.formData();
  const code = formData.get("code")?.toString();
  const state = formData.get("state")?.toString();
  const cookieState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    loginUrl.searchParams.set("error", "apple_auth_failed");
    const response = NextResponse.redirect(loginUrl, 303);
    response.cookies.delete(STATE_COOKIE);
    return response;
  }

  try {
    const redirectUri = new URL("/api/auth/apple/callback", request.url).toString();
    const clientSecret = await generateAppleClientSecret(config);

    const tokenRes = await fetch("https://appleid.apple.com/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) throw new Error("Apple token exchange failed");
    const tokens: { id_token: string } = await tokenRes.json();

    const { payload } = await jwtVerify(tokens.id_token, APPLE_JWKS, {
      issuer: "https://appleid.apple.com",
      audience: config.clientId,
    });

    const appleSub = payload.sub;
    const email = typeof payload.email === "string" ? payload.email : undefined;
    // Apple has encoded this as both a real boolean and the string
    // "true"/"false" across API versions — accept either.
    const emailVerified = payload.email_verified === true || payload.email_verified === "true";

    if (!appleSub || !email || !emailVerified) {
      loginUrl.searchParams.set("error", "apple_email_unverified");
      const response = NextResponse.redirect(loginUrl, 303);
      response.cookies.delete(STATE_COOKIE);
      return response;
    }

    const name = parseAppleUserName(formData.get("user")?.toString() ?? null);

    let user = await prisma.user.findUnique({ where: { appleId: appleSub } });
    let isNewUser = false;
    const locale = await getLocale();

    if (!user) {
      const existingByEmail = await prisma.user.findUnique({ where: { email } });
      if (existingByEmail) {
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { appleId: appleSub },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email,
            name: name ?? email.split("@")[0],
            appleId: appleSub,
            locale,
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
        notes: "Signed up via Apple.",
      });
      const baseUrl = new URL(request.url).origin;
      await sendWelcomeEmail({ to: user.email, name: user.name, privacyUrl: `${baseUrl}/privacy`, locale });
    }

    await createSession({ userId: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role });

    const response = NextResponse.redirect(new URL(user.role === "ADMIN" ? "/admin" : "/", request.url), 303);
    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch {
    loginUrl.searchParams.set("error", "apple_auth_failed");
    const response = NextResponse.redirect(loginUrl, 303);
    response.cookies.delete(STATE_COOKIE);
    return response;
  }
}
