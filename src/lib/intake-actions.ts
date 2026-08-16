"use server";

import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getBaseUrl } from "@/lib/base-url";
import { sendIntakeFormRequestEmail, sendIntakeSubmissionEmail } from "@/lib/email";
import { generateIntakeInsights } from "@/lib/ai-insights";
import { buildIntakeAnswers, INTAKE_CONSENT_FIELD_NAME } from "@/lib/intake-form-schema";

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
}: {
  clientName: string;
  clientEmail: string;
  counselorId: string;
  counselorName: string;
  counselorEmail: string | null;
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
        expiresAt: new Date(Date.now() + INTAKE_TOKEN_TTL_MS),
      },
    });

    const baseUrl = await getBaseUrl();
    const intakeUrl = `${baseUrl}/intake?token=${rawToken}`;
    await sendIntakeFormRequestEmail({ to: clientEmail, name: clientName, counselorName, intakeUrl });
  } catch (err) {
    console.error("[intake] Failed to create/send intake form link:", err);
  }
}

export type IntakeTokenInfo = {
  clientName: string;
  counselorName: string;
};

/** Validates a raw token from the URL. Returns null for missing, unknown,
 * expired, or already-used links — the page shows a generic invalid state
 * either way, never distinguishing why. */
export async function validateIntakeToken(rawToken: string): Promise<IntakeTokenInfo | null> {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const record = await prisma.intakeFormToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;
  return { clientName: record.clientName, counselorName: record.counselorName };
}

export type IntakeSubmitState = { error?: string; success?: boolean } | undefined;

/** Processes a submitted intake form: AI summary (best-effort), straight to
 * the therapist's inbox, then marks the link used. The answers are held only
 * in memory for the duration of this request — never written to our
 * database at any point. */
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

  const answers = buildIntakeAnswers(formData);

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

  await prisma.intakeFormToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });

  return { success: true };
}
