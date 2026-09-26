"use server";

import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getBaseUrl } from "@/lib/base-url";
import { sendIntakeFormRequestEmail, sendIntakeSubmissionEmail } from "@/lib/email";
import { generateIntakeInsights } from "@/lib/ai-insights";
import { buildIntakeAnswers, INTAKE_CONSENT_FIELD_NAME } from "@/lib/intake-form-schema";
import { getIntakeSections } from "@/lib/intake-form-config";
import { getCurrentUser } from "@/lib/session";
import { hasConfirmedSession, getFirstConfirmedSessionCounselor } from "@/lib/upcoming-items";
import { getLocale } from "@/lib/i18n/locale";
import type { Locale } from "@/lib/i18n/locale";

const INTAKE_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/** Creates a one-time intake-form link and emails it to the client. Called
 * right when a counseling session is requested (paid pre-booking or manual
 * request) — failures here are logged but never block the booking itself. */
export async function sendIntakeFormLink({
  clientName,
  clientEmail,
  counselorId,
  counselorName,
  counselorEmail,
  locale = "en",
}: {
  clientName: string;
  clientEmail: string;
  counselorId: string;
  counselorName: string;
  counselorEmail: string | null;
  locale?: Locale;
}) {
  try {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    await prisma.intakeFormToken.create({
      data: {
        tokenHash,
        clientName,
        clientEmail,
        counselorId,
        counselorName,
        counselorEmail,
        locale,
        expiresAt: new Date(Date.now() + INTAKE_TOKEN_TTL_MS),
      },
    });

    const baseUrl = await getBaseUrl();
    const intakeUrl = `${baseUrl}/intake?token=${rawToken}`;
    await sendIntakeFormRequestEmail({ to: clientEmail, name: clientName, counselorName, intakeUrl, locale });
  } catch (err) {
    console.error("[intake] Failed to create/send intake form link:", err);
  }
}

export type IntakeTokenInfo = {
  clientName: string;
  counselorName: string;
  locale: Locale;
};

/** Validates a raw token from the URL. Returns null for missing, unknown,
 * expired, or already-used links — the page shows a generic invalid state
 * either way, never distinguishing why. locale is snapshotted from when
 * the session was requested (not read from a cookie) so the form renders
 * in the right language even when opened on a device that never had the
 * original visitor's locale cookie set. */
export async function validateIntakeToken(rawToken: string): Promise<IntakeTokenInfo | null> {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const record = await prisma.intakeFormToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;
  return {
    clientName: record.clientName,
    counselorName: record.counselorName,
    locale: record.locale === "ar" ? "ar" : "en",
  };
}

export type IntakeSubmitState = { error?: string; success?: boolean } | undefined;

/** Processes a submitted intake form: AI summary (best-effort), emailed to
 * the therapist's inbox, saved as an IntakeSubmission so it shows up in
 * that client's profile inside the assigned counselor's therapist portal
 * (visible to that counselor only — never the admin, never another
 * counselor), then marks the link used. */
export async function submitIntakeFormAction(
  _prevState: IntakeSubmitState,
  formData: FormData,
): Promise<IntakeSubmitState> {
  const rawToken = String(formData.get("token") ?? "");
  if (!rawToken) return { error: "This link is invalid or has expired." };

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const record = await prisma.intakeFormToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "This link is invalid or has expired. Please contact us for a new one." };
  }

  if (!record.counselorEmail) {
    console.error(`[intake] Counselor ${record.counselorId} has no notification email — cannot deliver intake form.`);
    return { error: "We couldn't deliver your form right now. Please contact us directly." };
  }

  if (formData.get(INTAKE_CONSENT_FIELD_NAME) !== "on") {
    return { error: "Please confirm you understand how this information is used before submitting." };
  }

  // Parsed against whichever sections were actually rendered to this client
  // (record.locale, snapshotted when the link was created) — the Arabic and
  // English section arrays are fully independent, so parsing against the
  // wrong one would silently drop every answer.
  const sections = await getIntakeSections(record.locale === "ar" ? "ar" : "en");
  const answers = buildIntakeAnswers(sections, formData);

  const aiSummary = await generateIntakeInsights(answers);

  const sent = await sendIntakeSubmissionEmail({
    to: record.counselorEmail,
    clientName: record.clientName,
    clientEmail: record.clientEmail,
    counselorName: record.counselorName,
    answers,
    aiSummary,
  });

  if (!sent) {
    return { error: "We couldn't deliver your form right now. Please try again in a moment." };
  }

  await prisma.intakeSubmission.create({
    data: {
      counselorId: record.counselorId,
      clientName: record.clientName,
      clientEmail: record.clientEmail,
      answers,
      aiSummary,
    },
  });

  await prisma.intakeFormToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });

  return { success: true };
}

export type MyIntakeSubmission = {
  counselorName: string;
  answers: { section: string; label: string; value: string }[];
  submittedAt: string;
};

/** The logged-in client's own most recent intake submission, scoped to
 * since this account was created — an older submission tied to the same
 * email from a since-deleted account doesn't count, so deleting and
 * re-signing up with the same email correctly gets a fresh, unlocked
 * intake form (see deleteUserAccountCompletely, which intentionally keeps
 * IntakeSubmission rows as the counselor's clinical record rather than
 * deleting them). Returns null when nothing qualifies, meaning the form
 * is still open to fill in. */
export async function getMyIntakeSubmission(email: string, accountCreatedAt: Date): Promise<MyIntakeSubmission | null> {
  const submission = await prisma.intakeSubmission.findFirst({
    where: { clientEmail: email, submittedAt: { gte: accountCreatedAt } },
    orderBy: { submittedAt: "desc" },
  });
  if (!submission) return null;
  return {
    counselorName: (await prisma.counselor.findUnique({ where: { id: submission.counselorId }, select: { name: true } }))?.name ?? "",
    answers: submission.answers as { section: string; label: string; value: string }[],
    submittedAt: submission.submittedAt.toISOString(),
  };
}

/** Same submission flow as submitIntakeFormAction, but for a client
 * filling out their intake form from their own logged-in account (My
 * Profile → My intake form) instead of an emailed one-time token link —
 * identity comes from the session, not a token. Routed to whichever
 * counselor this client's first confirmed session is with. */
export async function submitAccountIntakeFormAction(
  _prevState: IntakeSubmitState,
  formData: FormData,
): Promise<IntakeSubmitState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in and try again." };

  const [confirmed, counselor] = await Promise.all([
    hasConfirmedSession(user.email),
    getFirstConfirmedSessionCounselor(user.email),
  ]);
  if (!confirmed || !counselor) {
    return { error: "This unlocks once your first session is booked and confirmed." };
  }
  if (!counselor.counselorEmail) {
    console.error(`[intake] Counselor ${counselor.counselorId} has no notification email — cannot deliver intake form.`);
    return { error: "We couldn't deliver your form right now. Please contact us directly." };
  }

  if (formData.get(INTAKE_CONSENT_FIELD_NAME) !== "on") {
    return { error: "Please confirm you understand how this information is used before submitting." };
  }

  const locale = await getLocale();
  const sections = await getIntakeSections(locale);
  const answers = buildIntakeAnswers(sections, formData);

  const aiSummary = await generateIntakeInsights(answers);

  const sent = await sendIntakeSubmissionEmail({
    to: counselor.counselorEmail,
    clientName: user.name,
    clientEmail: user.email,
    counselorName: counselor.counselorName,
    answers,
    aiSummary,
  });

  if (!sent) {
    return { error: "We couldn't deliver your form right now. Please try again in a moment." };
  }

  await prisma.intakeSubmission.create({
    data: {
      counselorId: counselor.counselorId,
      clientName: user.name,
      clientEmail: user.email,
      answers,
      aiSummary,
    },
  });

  return { success: true };
}
