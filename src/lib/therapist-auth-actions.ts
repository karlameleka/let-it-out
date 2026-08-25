"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createTherapistSession,
  destroyTherapistSession,
  requireCounselor,
} from "@/lib/therapist-session";
import { sendPasswordResetEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/base-url";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const RESET_REQUEST_COOLDOWN_MS = 60 * 1000; // 1 minute
const MAX_FAILED_LOGIN_ATTEMPTS = 8;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const BCRYPT_COST = 12;

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email."),
  password: z.string().min(1, "Please enter your password."),
});

export type TherapistAuthFormState = { error?: string } | undefined;

export async function loginCounselorAction(
  _prevState: TherapistAuthFormState,
  formData: FormData,
): Promise<TherapistAuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { email, password } = parsed.data;

  const counselor = await prisma.counselor.findFirst({ where: { email } });
  if (!counselor) {
    return { error: "Incorrect email or password." };
  }

  if (counselor.lockedUntil && counselor.lockedUntil > new Date()) {
    return { error: "Too many failed attempts. Please try again in a few minutes." };
  }

  if (!counselor.passwordHash) {
    return { error: "Portal access hasn't been set up for this account yet. Please contact the admin team." };
  }

  const valid = await bcrypt.compare(password, counselor.passwordHash);
  if (!valid) {
    const attempts = counselor.failedLoginAttempts + 1;
    await prisma.counselor.update({
      where: { id: counselor.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: attempts >= MAX_FAILED_LOGIN_ATTEMPTS ? new Date(Date.now() + LOGIN_LOCKOUT_MS) : null,
      },
    });
    return { error: "Incorrect email or password." };
  }

  await prisma.counselor.update({
    where: { id: counselor.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  await createTherapistSession({ counselorId: counselor.id, email, name: counselor.name });
  redirect("/therapist");
}

export async function logoutCounselorAction() {
  await destroyTherapistSession();
  redirect("/therapist/login");
}

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email."),
});

export type TherapistForgotPasswordFormState = { error?: string; success?: boolean } | undefined;

export async function forgotCounselorPasswordAction(
  _prevState: TherapistForgotPasswordFormState,
  formData: FormData,
): Promise<TherapistForgotPasswordFormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const counselor = await prisma.counselor.findFirst({ where: { email: parsed.data.email } });

  // Always report success — this form must not be usable to check which
  // emails belong to a portal account. Same silent-cooldown pattern as the
  // client-facing forgot-password flow.
  const onCooldown =
    counselor?.lastPasswordResetRequestAt &&
    Date.now() - counselor.lastPasswordResetRequestAt.getTime() < RESET_REQUEST_COOLDOWN_MS;

  if (counselor && !onCooldown) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    await prisma.counselor.update({
      where: { id: counselor.id },
      data: {
        resetTokenHash,
        resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        lastPasswordResetRequestAt: new Date(),
      },
    });

    const baseUrl = await getBaseUrl();
    const resetUrl = `${baseUrl}/therapist/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail({ to: parsed.data.email, name: counselor.name, resetUrl });
  }

  return { success: true };
}

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "This reset link is invalid."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ["confirmPassword"],
  });

export type TherapistResetPasswordFormState = { error?: string; success?: boolean } | undefined;

export async function resetCounselorPasswordAction(
  _prevState: TherapistResetPasswordFormState,
  formData: FormData,
): Promise<TherapistResetPasswordFormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const resetTokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
  const counselor = await prisma.counselor.findUnique({ where: { resetTokenHash } });

  if (!counselor || !counselor.resetTokenExpiresAt || counselor.resetTokenExpiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, BCRYPT_COST);
  await prisma.counselor.update({
    where: { id: counselor.id },
    data: {
      passwordHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  return { success: true };
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Please enter your current password."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ["confirmPassword"],
  });

export type TherapistChangePasswordFormState = { error?: string; success?: boolean } | undefined;

export async function changeCounselorPasswordAction(
  _prevState: TherapistChangePasswordFormState,
  formData: FormData,
): Promise<TherapistChangePasswordFormState> {
  const session = await requireCounselor().catch(() => null);
  if (!session) return { error: "Please log in to change your password." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const counselor = await prisma.counselor.findUnique({ where: { id: session.counselorId } });
  if (!counselor || !counselor.passwordHash) return { error: "Account not found." };

  const valid = await bcrypt.compare(parsed.data.currentPassword, counselor.passwordHash);
  if (!valid) return { error: "Current password is incorrect." };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, BCRYPT_COST);
  await prisma.counselor.update({ where: { id: counselor.id }, data: { passwordHash } });

  return { success: true };
}
