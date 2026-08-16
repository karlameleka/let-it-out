import "server-only";
import nodemailer from "nodemailer";

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "letitoutsupport@gmail.com";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;
  if (!user || !pass) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return transporter;
}

/**
 * Sends a notification email to the support inbox. Failures are logged but
 * never thrown — a missing/broken email config should not block a customer's
 * form submission from succeeding.
 */
export async function sendSupportNotification({
  subject,
  lines,
  extraRecipients,
}: {
  subject: string;
  lines: { label: string; value: string }[];
  /** Additional addresses to notify alongside the support inbox — e.g. the
   * specific counselor a booking was made with. Empty/undefined entries are
   * dropped so a counselor without an email on file is silently skipped. */
  extraRecipients?: (string | null | undefined)[];
}) {
  const transport = getTransporter();
  if (!transport) {
    console.warn(
      `[email] Skipped "${subject}" — EMAIL_USER / EMAIL_APP_PASSWORD not configured.`,
    );
    return;
  }

  const recipients = [SUPPORT_EMAIL, ...(extraRecipients ?? [])].filter(
    (r): r is string => Boolean(r && r.trim()),
  );

  const text = lines.map((l) => `${l.label}: ${l.value}`).join("\n");
  const html = `
    <div style="font-family: sans-serif; font-size: 14px; color: #123543;">
      <h2 style="color: #1e5b73; margin-bottom: 16px;">${subject}</h2>
      <table cellpadding="6" style="border-collapse: collapse;">
        ${lines
          .map(
            (l) => `
          <tr>
            <td style="font-weight: 600; vertical-align: top; padding-right: 12px;">${l.label}</td>
            <td style="white-space: pre-line;">${escapeHtml(l.value)}</td>
          </tr>`,
          )
          .join("")}
      </table>
    </div>
  `;

  try {
    await transport.sendMail({
      from: `"Let It Out" <${process.env.EMAIL_USER}>`,
      to: recipients,
      subject: `Let It Out — ${subject}`,
      text,
      html,
    });
  } catch (err) {
    console.error(`[email] Failed to send "${subject}":`, err);
  }
}

/**
 * Sends a friendly confirmation email to the person who filled out a form.
 * Same fail-silently behavior as sendSupportNotification — never blocks the
 * form submission itself.
 */
export async function sendCustomerConfirmation({
  to,
  name,
  subject,
  intro,
  lines,
  closing,
}: {
  to: string;
  name: string;
  subject: string;
  intro: string;
  lines?: { label: string; value: string }[];
  closing?: string;
}) {
  const transport = getTransporter();
  if (!transport) {
    console.warn(
      `[email] Skipped customer confirmation "${subject}" to ${to} — not configured.`,
    );
    return;
  }

  const closingText = closing ?? "Warmly,\nThe Let It Out team";

  const text = [
    `Hi ${name},`,
    "",
    intro,
    ...(lines ? ["", ...lines.map((l) => `${l.label}: ${l.value}`)] : []),
    "",
    closingText,
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; font-size: 14px; color: #123543; line-height: 1.6;">
      <p style="font-family: Georgia, serif; font-size: 20px; color: #1e5b73; font-weight: 700; margin-bottom: 20px;">Let It Out</p>
      <p>Hi ${escapeHtml(name)},</p>
      <p>${escapeHtml(intro)}</p>
      ${
        lines
          ? `<table cellpadding="6" style="border-collapse: collapse; margin: 12px 0;">
        ${lines
          .map(
            (l) => `
          <tr>
            <td style="font-weight: 600; vertical-align: top; padding-right: 12px;">${l.label}</td>
            <td style="white-space: pre-line;">${escapeHtml(l.value)}</td>
          </tr>`,
          )
          .join("")}
      </table>`
          : ""
      }
      <p style="white-space: pre-line;">${escapeHtml(closingText)}</p>
    </div>
  `;

  try {
    await transport.sendMail({
      from: `"Let It Out" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Let It Out — ${subject}`,
      text,
      html,
    });
  } catch (err) {
    console.error(`[email] Failed to send customer confirmation "${subject}" to ${to}:`, err);
  }
}

/**
 * Sends a password-reset link. Same fail-silently behavior as the other
 * senders, but the caller must still return a generic success response
 * regardless — never reveal whether an email is registered.
 */
export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  const transport = getTransporter();
  if (!transport) {
    console.warn(`[email] Skipped password reset email to ${to} — not configured.`);
    return;
  }

  const text = [
    `Hi ${name},`,
    "",
    "Someone requested a password reset for your Let It Out account. If this was you, use the link below to choose a new password — it expires in 1 hour:",
    "",
    resetUrl,
    "",
    "If you didn't request this, you can safely ignore this email.",
    "",
    "Warmly,\nThe Let It Out team",
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; font-size: 14px; color: #123543; line-height: 1.6;">
      <p style="font-family: Georgia, serif; font-size: 20px; color: #1e5b73; font-weight: 700; margin-bottom: 20px;">Let It Out</p>
      <p>Hi ${escapeHtml(name)},</p>
      <p>Someone requested a password reset for your account. If this was you, click below to choose a new password — this link expires in 1 hour.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #1e5b73; color: #ffffff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 600; display: inline-block;">Reset your password</a>
      </p>
      <p style="color: #6b7c80; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      <p>Warmly,<br />The Let It Out team</p>
    </div>
  `;

  try {
    await transport.sendMail({
      from: `"Let It Out" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Let It Out — Reset your password",
      text,
      html,
    });
  } catch (err) {
    console.error(`[email] Failed to send password reset email to ${to}:`, err);
  }
}

/**
 * Sent to the client right when a counseling session is requested, with a
 * link to their private intake form. Same fail-silently behavior as the
 * other senders.
 */
export async function sendIntakeFormRequestEmail({
  to,
  name,
  counselorName,
  intakeUrl,
}: {
  to: string;
  name: string;
  counselorName: string;
  intakeUrl: string;
}) {
  const transport = getTransporter();
  if (!transport) {
    console.warn(`[email] Skipped intake form request email to ${to} — not configured.`);
    return;
  }

  const text = [
    `Hi ${name},`,
    "",
    `Thanks for requesting a session with ${counselorName}. Before your first session, we ask every client to fill out a short intake form — it helps your therapist understand your background and prepare for your work together.`,
    "",
    "This form goes directly and only to your therapist. It is never stored on our servers, never seen by anyone at Let It Out, and never shared with any third party — it exists solely between you and your therapist.",
    "",
    intakeUrl,
    "",
    "It takes about 10-15 minutes. Please fill it out before your session if you can.",
    "",
    "Warmly,\nThe Let It Out team",
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; font-size: 14px; color: #123543; line-height: 1.6;">
      <p style="font-family: Georgia, serif; font-size: 20px; color: #1e5b73; font-weight: 700; margin-bottom: 20px;">Let It Out</p>
      <p>Hi ${escapeHtml(name)},</p>
      <p>Thanks for requesting a session with ${escapeHtml(counselorName)}. Before your first session, we ask every client to fill out a short intake form — it helps your therapist understand your background and prepare for your work together.</p>
      <p style="background: #f4f8f9; border-radius: 12px; padding: 14px 16px; color: #345a63;">
        This form goes directly and only to your therapist. It is <strong>never stored on our servers</strong>,
        never seen by anyone at Let It Out, and never shared with any third party — it exists solely between
        you and your therapist.
      </p>
      <p style="margin: 24px 0;">
        <a href="${intakeUrl}" style="background-color: #1e5b73; color: #ffffff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 600; display: inline-block;">Fill out your intake form</a>
      </p>
      <p style="color: #6b7c80; font-size: 13px;">Takes about 10-15 minutes. Please complete it before your session if you can.</p>
      <p>Warmly,<br />The Let It Out team</p>
    </div>
  `;

  try {
    await transport.sendMail({
      from: `"Let It Out" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Let It Out — Your intake form",
      text,
      html,
    });
  } catch (err) {
    console.error(`[email] Failed to send intake form request email to ${to}:`, err);
  }
}

/**
 * Delivers a submitted intake form directly to the assigned therapist —
 * raw answers plus an optional AI-generated prep summary. This is the only
 * place the form content is ever transmitted; it's never written to our
 * database. Unlike the other senders, a failed send here is surfaced to the
 * caller (returns false) since there's no stored copy to retry from.
 */
export async function sendIntakeSubmissionEmail({
  to,
  clientName,
  clientEmail,
  counselorName,
  answers,
  aiSummary,
}: {
  to: string;
  clientName: string;
  clientEmail: string;
  counselorName: string;
  answers: { section: string; label: string; value: string }[];
  aiSummary: string | null;
}): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.warn(`[email] Skipped intake submission email to ${to} — not configured.`);
    return false;
  }

  const answersText = answers.map((a) => `${a.label}\n${a.value}`).join("\n\n");

  const text = [
    `New intake form submitted by ${clientName} (${clientEmail}) for ${counselorName}.`,
    "",
    "This information is confidential — sent only to you, never stored on our servers.",
    "",
    ...(aiSummary ? ["=== AI-assisted prep summary ===", aiSummary, ""] : []),
    "=== Full intake form ===",
    answersText,
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; font-size: 14px; color: #123543; line-height: 1.6;">
      <p style="font-family: Georgia, serif; font-size: 20px; color: #1e5b73; font-weight: 700; margin-bottom: 8px;">Let It Out</p>
      <h2 style="color: #1e5b73; margin: 0 0 4px;">New intake form: ${escapeHtml(clientName)}</h2>
      <p style="color: #6b7c80; font-size: 13px; margin-top: 0;">${escapeHtml(clientEmail)} · for ${escapeHtml(counselorName)}</p>
      <p style="background: #f4f8f9; border-radius: 12px; padding: 12px 16px; color: #345a63; font-size: 13px;">
        Confidential — sent directly and only to you. Not stored on our servers, not visible to anyone else at Let It Out.
      </p>
      ${
        aiSummary
          ? `<h3 style="color: #1e5b73; margin-top: 28px;">AI-assisted prep summary</h3>
             <div style="white-space: pre-line; background: #fff; border: 1px solid #e2e9ea; border-radius: 12px; padding: 16px;">${escapeHtml(aiSummary)}</div>`
          : ""
      }
      <h3 style="color: #1e5b73; margin-top: 28px;">Full intake form</h3>
      <table cellpadding="8" style="border-collapse: collapse; width: 100%;">
        ${answers
          .map(
            (a) => `
          <tr style="border-top: 1px solid #e2e9ea;">
            <td style="font-weight: 600; vertical-align: top; width: 40%;">${escapeHtml(a.label)}</td>
            <td style="white-space: pre-line;">${escapeHtml(a.value)}</td>
          </tr>`,
          )
          .join("")}
      </table>
    </div>
  `;

  try {
    await transport.sendMail({
      from: `"Let It Out" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Let It Out — Intake form: ${clientName}`,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error(`[email] Failed to send intake submission email to ${to}:`, err);
    return false;
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
