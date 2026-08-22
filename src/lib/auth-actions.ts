"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroySession,
  requireUser,
  createPendingTwoFactorSession,
  getPendingTwoFactorUserId,
  clearPendingTwoFactorSession,
} from "@/lib/session";
import { verifyTotpCode, decryptTotpSecret, hashBackupCode } from "@/lib/totp";
import { sendPasswordResetEmail, sendWelcomeEmail, sendOtpEmail } from "@/lib/email";
import { sendSms, isSmsOtpEnabled } from "@/lib/sms";
import { createLead } from "@/lib/leads";
import { getBaseUrl } from "@/lib/base-url";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const RESET_REQUEST_COOLDOWN_MS = 60 * 1000; // 1 minute
const MAX_FAILED_LOGIN_ATTEMPTS = 8;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const BCRYPT_COST = 12;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_RESEND_COOLDOWN_MS = 45 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const signupSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email."),
  phone: z.string().trim().min(5, "Please enter a valid phone number."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  birthYear: z.string().trim().min(1, "Please select your birth year."),
  gender: z.string().trim().min(1, "Please select your gender."),
  country: z.string().trim().min(1, "Please select your country."),
  referralSource: z.string().trim().min(1, "Please tell us how you heard about us."),
  serviceInterests: z
    .array(z.string())
    .min(1, "Please select at least one service you're interested in."),
  otpChannel: z.enum(["EMAIL", "PHONE"]),
});

const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Please enter your email or phone number."),
  password: z.string().min(1, "Please enter your password."),
});

export type AuthFormState = { error?: string } | undefined;

function generateOtpCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function hashOtpCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 1)}${"*".repeat(Math.max(local.length - 1, 1))}@${domain}`;
}

function maskPhone(phone: string): string {
  const last4 = phone.slice(-4);
  return `${"•".repeat(Math.max(phone.length - 4, 0))}${last4}`;
}

async function sendOtpCode(
  channel: "EMAIL" | "PHONE",
  { email, phone, name, code }: { email: string; phone: string; name: string; code: string },
): Promise<boolean> {
  if (channel === "EMAIL") {
    return sendOtpEmail({ to: email, name, code });
  }
  return sendSms({ to: phone, body: `Your Let It Out verification code is ${code}. It expires in 10 minutes.` });
}

export type SignupFormState =
  | { error: string }
  | { pendingSignupId: string; channel: "EMAIL" | "PHONE"; destination: string }
  | undefined;

/** Step 1 of signup: validates the form, stashes it as a PendingSignup (no
 * User row yet — the email/phone aren't "claimed" until verified), and
 * sends a 6-digit code to the chosen channel. */
export async function requestSignupOtp(
  _prevState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    birthYear: formData.get("birthYear"),
    gender: formData.get("gender"),
    country: formData.get("country"),
    referralSource: formData.get("referralSource"),
    serviceInterests: formData.getAll("serviceInterests"),
    otpChannel: formData.get("otpChannel") || "EMAIL",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, phone, password, birthYear, gender, country, referralSource, serviceInterests, otpChannel } =
    parsed.data;

  if (otpChannel === "PHONE" && !isSmsOtpEnabled()) {
    return { error: "SMS verification isn't available right now — please use email instead." };
  }

  const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
  if (existingUser) {
    return {
      error:
        existingUser.email === email
          ? "An account with this email already exists."
          : "An account with this phone number already exists.",
    };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const code = generateOtpCode();

  // Replace, don't update — any previous unfinished attempt for this
  // email/phone is superseded by this one.
  await prisma.pendingSignup.deleteMany({ where: { OR: [{ email }, { phone }] } });

  const pending = await prisma.pendingSignup.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      birthYear: Number(birthYear),
      gender,
      country,
      referralSource,
      serviceInterests,
      otpChannel,
      otpCodeHash: hashOtpCode(code),
      otpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  const sent = await sendOtpCode(otpChannel, { email, phone, name, code });
  if (!sent) {
    await prisma.pendingSignup.delete({ where: { id: pending.id } }).catch(() => {});
    return { error: "We couldn't send your verification code. Please try again." };
  }

  return {
    pendingSignupId: pending.id,
    channel: otpChannel,
    destination: otpChannel === "EMAIL" ? maskEmail(email) : maskPhone(phone),
  };
}

const otpVerifySchema = z.object({
  pendingSignupId: z.string().min(1),
  code: z.string().trim().min(1, "Please enter the verification code."),
});

export type OtpVerifyState = { error?: string } | undefined;

/** Step 2 of signup: checks the code against the PendingSignup, and only on
 * success creates the real User (and its welcome email, CRM lead, session). */
export async function verifySignupOtp(
  _prevState: OtpVerifyState,
  formData: FormData,
): Promise<OtpVerifyState> {
  const parsed = otpVerifySchema.safeParse({
    pendingSignupId: formData.get("pendingSignupId"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { pendingSignupId, code } = parsed.data;
  const pending = await prisma.pendingSignup.findUnique({ where: { id: pendingSignupId } });
  if (!pending) {
    return { error: "This signup session has expired. Please start over." };
  }
  if (pending.otpExpiresAt < new Date()) {
    await prisma.pendingSignup.delete({ where: { id: pending.id } }).catch(() => {});
    return { error: "This code has expired. Please start over to get a new one." };
  }
  if (pending.attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.pendingSignup.delete({ where: { id: pending.id } }).catch(() => {});
    return { error: "Too many incorrect attempts. Please start over." };
  }

  if (hashOtpCode(code) !== pending.otpCodeHash) {
    await prisma.pendingSignup.update({ where: { id: pending.id }, data: { attempts: { increment: 1 } } });
    return { error: "That code isn't right. Please try again." };
  }

  // Re-check uniqueness in case the email/phone got claimed by someone else
  // while this signup sat unverified.
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email: pending.email }, { phone: pending.phone }] },
  });
  if (existingUser) {
    await prisma.pendingSignup.delete({ where: { id: pending.id } }).catch(() => {});
    return {
      error:
        existingUser.email === pending.email
          ? "An account with this email already exists."
          : "An account with this phone number already exists.",
    };
  }

  const user = await prisma.user.create({
    data: {
      name: pending.name,
      email: pending.email,
      phone: pending.phone,
      passwordHash: pending.passwordHash,
      birthYear: pending.birthYear,
      gender: pending.gender,
      country: pending.country,
      referralSource: pending.referralSource,
      serviceInterests: pending.serviceInterests,
    },
  });

  await prisma.pendingSignup.delete({ where: { id: pending.id } }).catch(() => {});

  const demographicNotes = [
    `Birth year: ${pending.birthYear}`,
    `Gender: ${pending.gender}`,
    `Country: ${pending.country}`,
    `Heard about us via: ${pending.referralSource}`,
    `Interested in: ${pending.serviceInterests.join(", ")}`,
  ].join("\n");

  await createLead({
    name: user.name,
    type: "ACCOUNT_SIGNUP",
    email: user.email,
    phone: user.phone ?? undefined,
    source: "Website",
    notes: demographicNotes,
  });

  const baseUrl = await getBaseUrl();
  await sendWelcomeEmail({ to: user.email, name: user.name, privacyUrl: `${baseUrl}/privacy` });

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
  });

  redirect("/");
}

export type OtpResendState = { error?: string; success?: boolean } | undefined;

export async function resendSignupOtp(
  _prevState: OtpResendState,
  formData: FormData,
): Promise<OtpResendState> {
  const pendingSignupId = String(formData.get("pendingSignupId") || "");
  const pending = pendingSignupId
    ? await prisma.pendingSignup.findUnique({ where: { id: pendingSignupId } })
    : null;
  if (!pending) {
    return { error: "This signup session has expired. Please start over." };
  }

  if (Date.now() - pending.otpSentAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
    return { error: "Please wait a moment before requesting another code." };
  }

  const code = generateOtpCode();
  const sent = await sendOtpCode(pending.otpChannel, {
    email: pending.email,
    phone: pending.phone,
    name: pending.name,
    code,
  });
  if (!sent) {
    return { error: "We couldn't resend your verification code. Please try again." };
  }

  await prisma.pendingSignup.update({
    where: { id: pending.id },
    data: { otpCodeHash: hashOtpCode(code), otpExpiresAt: new Date(Date.now() + OTP_TTL_MS), otpSentAt: new Date(), attempts: 0 },
  });

  return { success: true };
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { identifier, password } = parsed.data;

  const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier }, { phone: identifier }] } });
  if (!user) {
    return { error: "Incorrect email/phone or password." };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { error: "Too many failed attempts. Please try again in a few minutes." };
  }

  if (!user.passwordHash) {
    return { error: "This account signed up with Google. Please continue with Google below." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: attempts >= MAX_FAILED_LOGIN_ATTEMPTS ? new Date(Date.now() + LOGIN_LOCKOUT_MS) : null,
      },
    });
    return { error: "Incorrect email/phone or password." };
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  if (user.role === "ADMIN" && user.totpEnabled) {
    await createPendingTwoFactorSession(user.id);
    redirect("/login/verify");
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
  });

  redirect(user.role === "ADMIN" ? "/admin" : "/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormState = { error?: string; success?: boolean } | undefined;

export async function changePasswordAction(
  _prevState: ChangePasswordFormState,
  formData: FormData,
): Promise<ChangePasswordFormState> {
  const session = await requireUser().catch(() => null);
  if (!session) return { error: "Please log in to change your password." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "Account not found." };

  // Accounts created via Google sign-in have no password yet — this becomes
  // a "set a password" flow instead of "change password" for them.
  if (user.passwordHash) {
    if (!parsed.data.currentPassword) {
      return { error: "Please enter your current password." };
    }
    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return { error: "Current password is incorrect." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, BCRYPT_COST);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}

const deleteAccountSchema = z.object({
  password: z.string().optional(),
});

export type DeleteAccountFormState = { error?: string; success?: boolean } | undefined;

export async function deleteAccountAction(
  _prevState: DeleteAccountFormState,
  formData: FormData,
): Promise<DeleteAccountFormState> {
  const session = await requireUser().catch(() => null);
  if (!session) return { error: "Please log in again." };

  const parsed = deleteAccountSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "Account not found." };

  // Accounts created via Google sign-in have no password to confirm with —
  // the session cookie is already the authorization for this request.
  if (user.passwordHash) {
    if (!parsed.data.password) {
      return { error: "Please enter your password." };
    }
    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) return { error: "Incorrect password." };
  }

  // JournalEntry and PushSubscription require a userId, so those rows are
  // deleted outright. Order and BookingRequest keep userId optional — they
  // represent real business records (a paid order, a session request), so
  // they're kept and just disassociated from the deleted account.
  await prisma.$transaction([
    prisma.journalEntry.deleteMany({ where: { userId: user.id } }),
    prisma.pushSubscription.deleteMany({ where: { userId: user.id } }),
    prisma.order.updateMany({ where: { userId: user.id }, data: { userId: null } }),
    prisma.bookingRequest.updateMany({ where: { userId: user.id }, data: { userId: null } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);

  await destroySession();
  // No server-side redirect() here: the client clears the device-only
  // journal store first (this account's data, tied to userId, would
  // otherwise be orphaned in IndexedDB), then navigates itself.
  return { success: true };
}

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email."),
});

export type ForgotPasswordFormState = { error?: string; success?: boolean } | undefined;

export async function forgotPasswordAction(
  _prevState: ForgotPasswordFormState,
  formData: FormData,
): Promise<ForgotPasswordFormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Always report success, whether or not the account exists — otherwise
  // this form becomes a way to check which emails are registered. The
  // cooldown check below is likewise silent, so it can't be used to infer
  // that an account exists and just made a recent request.
  const onCooldown =
    user?.lastPasswordResetRequestAt &&
    Date.now() - user.lastPasswordResetRequestAt.getTime() < RESET_REQUEST_COOLDOWN_MS;

  if (user && !onCooldown) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash,
        resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        lastPasswordResetRequestAt: new Date(),
      },
    });

    const baseUrl = await getBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
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

export type ResetPasswordFormState = { error?: string; success?: boolean } | undefined;

export async function resetPasswordAction(
  _prevState: ResetPasswordFormState,
  formData: FormData,
): Promise<ResetPasswordFormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const resetTokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
  const user = await prisma.user.findUnique({ where: { resetTokenHash } });

  if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, BCRYPT_COST);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetTokenHash: null, resetTokenExpiresAt: null },
  });

  return { success: true };
}

const verifyTwoFactorSchema = z.object({
  code: z.string().trim().min(6, "Please enter your 6-digit code or a backup code."),
});

export type VerifyTwoFactorFormState = { error?: string } | undefined;

/** The code-entry step of admin login, once the password has already checked out. */
export async function verifyTwoFactorAction(
  _prevState: VerifyTwoFactorFormState,
  formData: FormData,
): Promise<VerifyTwoFactorFormState> {
  const parsed = verifyTwoFactorSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const userId = await getPendingTwoFactorUserId();
  if (!userId) {
    return { error: "Your login session expired. Please log in again." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.totpEnabled || !user.totpSecret) {
    await clearPendingTwoFactorSession();
    return { error: "Your login session expired. Please log in again." };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { error: "Too many failed attempts. Please try again in a few minutes." };
  }

  const submitted = parsed.data.code.trim();
  const isTotpValid = verifyTotpCode(decryptTotpSecret(user.totpSecret), submitted);
  const submittedHash = hashBackupCode(submitted);
  const matchedBackupCode = user.totpBackupCodeHashes.includes(submittedHash);

  if (!isTotpValid && !matchedBackupCode) {
    const attempts = user.failedLoginAttempts + 1;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: attempts >= MAX_FAILED_LOGIN_ATTEMPTS ? new Date(Date.now() + LOGIN_LOCKOUT_MS) : null,
      },
    });
    return { error: "That code didn't work. Please try again." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      // Backup codes are single-use — burn it on redemption.
      totpBackupCodeHashes: matchedBackupCode
        ? user.totpBackupCodeHashes.filter((h) => h !== submittedHash)
        : user.totpBackupCodeHashes,
    },
  });

  await clearPendingTwoFactorSession();
  await createSession({ userId: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role });
  redirect("/admin");
}
