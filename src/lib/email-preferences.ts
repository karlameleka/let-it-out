import "server-only";
import crypto from "crypto";
import { prisma } from "@/lib/db";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function sign(email: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return crypto.createHmac("sha256", secret).update(normalizeEmail(email)).digest("hex");
}

/** Builds the "manage email preferences" link appended to every
 * customer-facing email (see emailShell in email.ts) — a stable,
 * non-expiring signed link (no DB row needed to issue it, so it keeps
 * working even in an email read months later) rather than a one-time
 * token, the same way most real "unsubscribe" links work. */
export function emailPreferencesUrl(email: string, baseUrl: string): string {
  const token = sign(email);
  return `${baseUrl}/email-preferences?email=${encodeURIComponent(email)}&token=${token}`;
}

export function verifyEmailPreferencesToken(email: string, token: string): boolean {
  try {
    const expected = Buffer.from(sign(email));
    const actual = Buffer.from(token);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/** True when this address opted out of optional notification emails —
 * see the EmailPreference model comment for exactly which emails that
 * covers (currently just the assigned-resource notification). Essential/
 * transactional emails never check this. */
export async function hasOptedOutOfNotifications(email: string): Promise<boolean> {
  const pref = await prisma.emailPreference.findUnique({ where: { email: normalizeEmail(email) } });
  return pref?.notificationsOptOut ?? false;
}

export async function getEmailPreference(email: string): Promise<{ notificationsOptOut: boolean }> {
  const pref = await prisma.emailPreference.findUnique({ where: { email: normalizeEmail(email) } });
  return { notificationsOptOut: pref?.notificationsOptOut ?? false };
}

export async function setNotificationsOptOut(email: string, optOut: boolean): Promise<void> {
  const normalized = normalizeEmail(email);
  await prisma.emailPreference.upsert({
    where: { email: normalized },
    create: { email: normalized, notificationsOptOut: optOut },
    update: { notificationsOptOut: optOut },
  });
}
