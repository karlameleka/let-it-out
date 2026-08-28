"use server";

import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/session";
import { getBaseUrl } from "@/lib/base-url";
import { PromoDiscountType } from "@/generated/prisma/enums";

const REWARD_DISCOUNT_PERCENT = 20;
const REWARD_EXPIRY_DAYS = 60;

function buildReferralLink(baseUrl: string, code: string) {
  return `${baseUrl}/r/${code}`;
}

async function generateUniquePromoCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = `FRIEND${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const existing = await prisma.promoCode.findUnique({ where: { code } });
    if (!existing) return code;
  }
  throw new Error("Could not generate a unique promo code.");
}

export type ReferralInviteData = {
  link: string;
  code: string;
  qrDataUrl: string;
  friendsJoined: number;
};

/** Data for the "Invite a friend" card in Account settings: this user's
 * personal shareable link + a QR code encoding it, and how many friends
 * have activated a referral through it so far. */
export async function getReferralInviteData(): Promise<ReferralInviteData | null> {
  const session = await requireUser().catch(() => null);
  if (!session) return null;

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { referralCode: true } });
  if (!user) return null;

  const baseUrl = await getBaseUrl();
  const link = buildReferralLink(baseUrl, user.referralCode);
  const [qrDataUrl, friendsJoined] = await Promise.all([
    QRCode.toDataURL(link, { margin: 1, width: 220 }),
    prisma.userReferral.count({ where: { referrerId: session.userId } }),
  ]);

  return { link, code: user.referralCode, qrDataUrl, friendsJoined };
}

export type ActivateReferralResult =
  | { success: true; promoCode: string; discountPercent: number }
  | { success: false };

/**
 * Called client-side the moment a friend's PWA install completes (see
 * referral-activation-watcher.tsx) — visiting the invite link or signing
 * up alone never calls this, only a completed install does. Mints a
 * single-use 20%-off promo code for that friend.
 *
 * Deliberately unauthenticated: the friend usually isn't signed in yet at
 * install time, so there's no account to attribute the reward to beyond
 * "whoever's browser just triggered this" — the generated code itself,
 * shown to them right away, is what they redeem at checkout later.
 */
export async function activateReferral(code: string): Promise<ActivateReferralResult> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { success: false };

  const referrer = await prisma.user.findUnique({ where: { referralCode: trimmed }, select: { id: true } });
  if (!referrer) return { success: false };

  // Best-effort self-referral guard — only catches it when the friend
  // happens to already be logged in on this device at install time.
  const currentUser = await getCurrentUser().catch(() => null);
  if (currentUser && currentUser.userId === referrer.id) return { success: false };

  const promoCodeValue = await generateUniquePromoCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REWARD_EXPIRY_DAYS);

  await prisma.$transaction(async (tx) => {
    const promoCode = await tx.promoCode.create({
      data: {
        code: promoCodeValue,
        discountType: PromoDiscountType.PERCENT,
        discountValue: REWARD_DISCOUNT_PERCENT,
        maxRedemptions: 1,
        expiresAt,
      },
    });
    await tx.userReferral.create({
      data: { referrerId: referrer.id, promoCodeId: promoCode.id },
    });
  });

  return { success: true, promoCode: promoCodeValue, discountPercent: REWARD_DISCOUNT_PERCENT };
}
