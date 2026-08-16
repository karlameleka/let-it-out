"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { createSession, destroySession, requireUser } from "@/lib/session";
import { sendPasswordResetEmail } from "@/lib/email";
import { createLead } from "@/lib/leads";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

const signupSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  birthYear: z.string().trim().min(1, "Please select your birth year."),
  gender: z.string().trim().min(1, "Please select your gender."),
  country: z.string().trim().min(1, "Please select your country."),
  referralSource: z.string().trim().min(1, "Please tell us how you heard about us."),
  serviceInterests: z
    .array(z.string())
    .min(1, "Please select at least one service you're interested in."),
});

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email."),
  password: z.string().min(1, "Please enter your password."),
});

export type AuthFormState = { error?: string } | undefined;

export async function signupAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    birthYear: formData.get("birthYear"),
    gender: formData.get("gender"),
    country: formData.get("country"),
    referralSource: formData.get("referralSource"),
    serviceInterests: formData.getAll("serviceInterests"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, password, birthYear, gender, country, referralSource, serviceInterests } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      birthYear: Number(birthYear),
      gender,
      country,
      referralSource,
      serviceInterests,
    },
  });

  const demographicNotes = [
    `Birth year: ${birthYear}`,
    `Gender: ${gender}`,
    `Country: ${country}`,
    `Heard about us via: ${referralSource}`,
    `Interested in: ${serviceInterests.join(", ")}`,
  ].join("\n");

  await createLead({
    name,
    type: "ACCOUNT_SIGNUP",
    email,
    source: "Website",
    notes: demographicNotes,
  });

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  redirect("/journal");
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Incorrect email or password." };
  }

  if (!user.passwordHash) {
    return { error: "This account signed up with Google. Please continue with Google below." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Incorrect email or password." };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  redirect(user.role === "ADMIN" ? "/admin" : "/journal");
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

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
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
  // this form becomes a way to check which emails are registered.
  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: { resetTokenHash, resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
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

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetTokenHash: null, resetTokenExpiresAt: null },
  });

  return { success: true };
}
