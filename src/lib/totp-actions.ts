"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import {
  generateTotpSecret,
  encryptTotpSecret,
  decryptTotpSecret,
  buildTotpUri,
  verifyTotpCode,
  generateBackupCodes,
} from "@/lib/totp";

export type BeginEnrollmentResult =
  | { error: string }
  | { qrDataUrl: string; manualEntrySecret: string; backupCodes: string[] };

/**
 * Generates a fresh secret + backup codes and stores them (secret encrypted)
 * on the account, but leaves totpEnabled false until confirmTotpEnrollment
 * verifies the admin can actually produce a valid code from it — otherwise
 * a typo'd authenticator setup could lock the account out on next login.
 */
export async function beginTotpEnrollment(): Promise<BeginEnrollmentResult> {
  const session = await requireAdmin().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const rawSecret = generateTotpSecret();
  const { codes, hashes } = generateBackupCodes();

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      totpSecret: encryptTotpSecret(rawSecret),
      totpEnabled: false,
      totpBackupCodeHashes: hashes,
    },
  });

  const uri = buildTotpUri(rawSecret, session.email);
  const qrDataUrl = await QRCode.toDataURL(uri, { margin: 1, width: 240 });

  return { qrDataUrl, manualEntrySecret: rawSecret, backupCodes: codes };
}

const confirmSchema = z.object({
  code: z.string().trim().min(6, "Please enter the 6-digit code from your authenticator app."),
});

export type ConfirmEnrollmentFormState = { error?: string; success?: boolean } | undefined;

export async function confirmTotpEnrollment(
  _prevState: ConfirmEnrollmentFormState,
  formData: FormData,
): Promise<ConfirmEnrollmentFormState> {
  const session = await requireAdmin().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const parsed = confirmSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.totpSecret) {
    return { error: "Start setup again — no pending authenticator to confirm." };
  }

  if (!verifyTotpCode(decryptTotpSecret(user.totpSecret), parsed.data.code)) {
    return { error: "That code didn't match. Double-check your authenticator app and try again." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { totpEnabled: true } });
  revalidatePath("/admin/settings");
  return { success: true };
}

const disableSchema = z.object({
  password: z.string().min(1, "Please enter your password to confirm."),
});

export type DisableTwoFactorFormState = { error?: string; success?: boolean } | undefined;

export async function disableTotpAction(
  _prevState: DisableTwoFactorFormState,
  formData: FormData,
): Promise<DisableTwoFactorFormState> {
  const session = await requireAdmin().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const parsed = disableSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.passwordHash) return { error: "Account not found." };

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return { error: "Incorrect password." };

  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabled: false, totpSecret: null, totpBackupCodeHashes: [] },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}
