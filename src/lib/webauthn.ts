"use server";

import { headers } from "next/headers";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { setWebAuthnChallenge, getWebAuthnChallenge, clearWebAuthnChallenge } from "@/lib/webauthn-challenge";

/** WebAuthn's RP ID must be a bare hostname (no scheme/port) and the
 * ceremony's origin must be the exact scheme+host+port the browser is on —
 * derived from the request instead of an env var so this keeps working
 * across preview deployments without extra config. */
async function getRpIdAndOrigin() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const hostname = host.split(":")[0];
  const protocol = hostname === "localhost" ? "http" : "https";
  return { rpID: hostname, origin: `${protocol}://${host}` };
}

/** Whether the logged-in user has any Face ID/Touch ID/similar credential
 * registered — journal-lock-gate uses this to decide whether to offer
 * biometric unlock at all instead of only the password form. */
export async function hasWebAuthnCredential(): Promise<boolean> {
  const user = await requireUser().catch(() => null);
  if (!user) return false;
  const count = await prisma.webAuthnCredential.count({ where: { userId: user.userId } });
  return count > 0;
}

export async function getWebAuthnRegistrationOptions(): Promise<
  { options: PublicKeyCredentialCreationOptionsJSON; error?: never } | { options?: never; error: string }
> {
  const user = await requireUser().catch(() => null);
  if (!user) return { error: "Please log in again." };

  const { rpID } = await getRpIdAndOrigin();
  const existing = await prisma.webAuthnCredential.findMany({
    where: { userId: user.userId },
    select: { credentialId: true, transports: true },
  });

  const options = await generateRegistrationOptions({
    rpName: "Let It Out",
    rpID,
    userName: user.email,
    userDisplayName: user.name,
    attestationType: "none",
    // "platform" restricts this to the device's own biometric/PIN unlock
    // (Face ID, Touch ID, Windows Hello, Android fingerprint) rather than
    // offering a physical security key — this is specifically standing in
    // for the account password, not a second login factor.
    authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
    excludeCredentials: existing.map((c) => ({
      id: c.credentialId,
      transports: c.transports as AuthenticatorTransportFuture[],
    })),
  });

  await setWebAuthnChallenge(user.userId, options.challenge, "registration");
  return { options };
}

export async function verifyWebAuthnRegistration(
  response: RegistrationResponseJSON,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireUser().catch(() => null);
  if (!user) return { success: false, error: "Please log in again." };

  const expectedChallenge = await getWebAuthnChallenge(user.userId, "registration");
  if (!expectedChallenge) return { success: false, error: "That setup attempt expired — try again." };
  await clearWebAuthnChallenge();

  const { rpID, origin } = await getRpIdAndOrigin();

  let verification;
  try {
    verification = await verifyRegistrationResponse({ response, expectedChallenge, expectedOrigin: origin, expectedRPID: rpID });
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Verification failed." };
  }

  if (!verification.verified || !verification.registrationInfo) {
    return { success: false, error: "Couldn't verify that device." };
  }

  const { credential } = verification.registrationInfo;
  await prisma.webAuthnCredential.create({
    data: {
      userId: user.userId,
      credentialId: credential.id,
      publicKey: credential.publicKey,
      counter: BigInt(credential.counter),
      transports: credential.transports ?? [],
    },
  });

  return { success: true };
}

export async function getWebAuthnAuthenticationOptions(): Promise<
  { options: PublicKeyCredentialRequestOptionsJSON; error?: never } | { options?: never; error: string }
> {
  const user = await requireUser().catch(() => null);
  if (!user) return { error: "Please log in again." };

  const { rpID } = await getRpIdAndOrigin();
  const credentials = await prisma.webAuthnCredential.findMany({
    where: { userId: user.userId },
    select: { credentialId: true, transports: true },
  });
  if (credentials.length === 0) return { error: "No biometric unlock set up on this account." };

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "required",
    allowCredentials: credentials.map((c) => ({
      id: c.credentialId,
      transports: c.transports as AuthenticatorTransportFuture[],
    })),
  });

  await setWebAuthnChallenge(user.userId, options.challenge, "authentication");
  return { options };
}

/** Verifies a Face ID/Touch ID assertion and, if valid, unlocks the journal
 * the same way a correct password would — journal-lock-gate calls this
 * instead of verifyJournalLock when biometric unlock is available. */
export async function verifyJournalUnlockBiometric(
  response: AuthenticationResponseJSON,
): Promise<{ success: boolean; error?: string }> {
  const user = await requireUser().catch(() => null);
  if (!user) return { success: false, error: "Please log in again." };

  const expectedChallenge = await getWebAuthnChallenge(user.userId, "authentication");
  if (!expectedChallenge) return { success: false, error: "That unlock attempt expired — try again." };
  await clearWebAuthnChallenge();

  const stored = await prisma.webAuthnCredential.findUnique({ where: { credentialId: response.id } });
  if (!stored || stored.userId !== user.userId) return { success: false, error: "Unrecognized device." };

  const { rpID, origin } = await getRpIdAndOrigin();

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: stored.credentialId,
        publicKey: stored.publicKey,
        counter: Number(stored.counter),
        transports: stored.transports as AuthenticatorTransportFuture[],
      },
    });
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Verification failed." };
  }

  if (!verification.verified) return { success: false, error: "Couldn't verify — try again or use your password." };

  // Anti-replay: an authenticator's counter must strictly increase on
  // every use, so persisting the new value is what makes a captured old
  // assertion unusable a second time.
  await prisma.webAuthnCredential.update({
    where: { id: stored.id },
    data: { counter: verification.authenticationInfo.newCounter },
  });

  return { success: true };
}

/** Removes every registered biometric credential from this account —
 * password-gated like disabling admin 2FA, since it's a security-relevant
 * change and the account's real credential (the password) is what should
 * authorize turning off its faster substitute. */
export async function removeWebAuthnCredentials(password: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireUser().catch(() => null);
  if (!user) return { success: false, error: "Please log in again." };
  if (!password) return { success: false, error: "Enter your password to confirm." };

  const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
  if (!dbUser?.passwordHash) return { success: false, error: "This account has no password set." };

  const valid = await bcrypt.compare(password, dbUser.passwordHash);
  if (!valid) return { success: false, error: "Incorrect password." };

  await prisma.webAuthnCredential.deleteMany({ where: { userId: user.userId } });
  return { success: true };
}
