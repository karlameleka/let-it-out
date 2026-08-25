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
 * Sent once, right after a new account is created (password signup or
 * Google sign-in) — a warm welcome plus a plain-language, accurate summary
 * of how the account's data is protected. Every claim here mirrors the
 * Privacy Policy and the in-app journal privacy notice; never overstate
 * beyond what those pages actually promise. Same fail-silently behavior as
 * the other senders — a missing email config should never block signup.
 */
export async function sendWelcomeEmail({
  to,
  name,
  privacyUrl,
}: {
  to: string;
  name: string;
  privacyUrl: string;
}) {
  const transport = getTransporter();
  if (!transport) {
    console.warn(`[email] Skipped welcome email to ${to} — not configured.`);
    return;
  }

  const text = [
    `Hi ${name},`,
    "",
    "Welcome to Let It Out. We're glad you're here.",
    "",
    "Signing up for a mental health platform takes a real leap of trust, and we don't take that lightly — so before anything else, here's exactly how your information is protected:",
    "",
    "Your journal stays yours. Entries are encrypted on your own device (AES-256-GCM) and never sent to or stored on our servers, so no one at Let It Out can read them.",
    "",
    "Your password is never visible to anyone. It's one-way hashed the moment you set it — not even our team can see it.",
    "",
    "We never sell your data. No tracking cookies, no ad profiles, no third parties buying access to anything about you.",
    "",
    "You're always in control. Export or permanently delete your data at any time from Account settings — no waiting, no explanation needed.",
    "",
    "You can read the full details of how we handle your data here:",
    privacyUrl,
    "",
    "If anything about this ever feels unclear, just reply to this email or reach us at letitoutsupport@gmail.com — a real person will answer.",
    "",
    "Warmly,\nThe Let It Out team",
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; font-size: 14px; color: #123543; line-height: 1.6;">
      <p style="font-family: Georgia, serif; font-size: 20px; color: #1e5b73; font-weight: 700; margin-bottom: 20px;">Let It Out</p>
      <p>Hi ${escapeHtml(name)},</p>
      <p>Welcome to Let It Out. We're glad you're here.</p>
      <p>Signing up for a mental health platform takes a real leap of trust, and we don't take that lightly — so before anything else, here's exactly how your information is protected.</p>
      <table cellpadding="0" cellspacing="0" style="width: 100%; margin: 20px 0; border-collapse: separate; border-spacing: 0 10px;">
        <tr>
          <td style="background: #f4f8f9; border-radius: 12px; padding: 14px 16px; color: #345a63;">
            <strong>Your journal stays yours.</strong> Entries are encrypted on your own device (AES-256-GCM)
            and never sent to or stored on our servers — no one at Let It Out can read them.
          </td>
        </tr>
        <tr>
          <td style="background: #f4f8f9; border-radius: 12px; padding: 14px 16px; color: #345a63;">
            <strong>Your password is never visible to anyone.</strong> It's one-way hashed the moment you set
            it — not even our team can see it.
          </td>
        </tr>
        <tr>
          <td style="background: #f4f8f9; border-radius: 12px; padding: 14px 16px; color: #345a63;">
            <strong>We never sell your data.</strong> No tracking cookies, no ad profiles, no third parties
            buying access to anything about you.
          </td>
        </tr>
        <tr>
          <td style="background: #f4f8f9; border-radius: 12px; padding: 14px 16px; color: #345a63;">
            <strong>You're always in control.</strong> Export or permanently delete your data at any time
            from Account settings — no waiting, no explanation needed.
          </td>
        </tr>
      </table>
      <p style="margin: 24px 0;">
        <a href="${privacyUrl}" style="background-color: #1e5b73; color: #ffffff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 600; display: inline-block;">Read our full Privacy Policy</a>
      </p>
      <p style="color: #6b7c80; font-size: 13px;">If anything about this ever feels unclear, just reply to this email or reach us at letitoutsupport@gmail.com — a real person will answer.</p>
      <p>Warmly,<br />The Let It Out team</p>
    </div>
  `;

  try {
    await transport.sendMail({
      from: `"Let It Out" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Welcome to Let It Out — and a quick word on privacy",
      text,
      html,
    });
  } catch (err) {
    console.error(`[email] Failed to send welcome email to ${to}:`, err);
  }
}

/**
 * Sends a signup verification code. Unlike the other senders, a failed send
 * here is surfaced to the caller (returns false) — the person can't finish
 * signing up if the code never arrives, so requestSignupOtp needs to know.
 */
export async function sendOtpEmail({
  to,
  name,
  code,
}: {
  to: string;
  name: string;
  code: string;
}): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.warn(`[email] Skipped OTP email to ${to} — not configured.`);
    return false;
  }

  const text = [
    `Hi ${name},`,
    "",
    `Your Let It Out verification code is: ${code}`,
    "",
    "This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; font-size: 14px; color: #123543; line-height: 1.6;">
      <p style="font-family: Georgia, serif; font-size: 20px; color: #1e5b73; font-weight: 700; margin-bottom: 20px;">Let It Out</p>
      <p>Hi ${escapeHtml(name)},</p>
      <p>Your verification code is:</p>
      <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1e5b73; margin: 20px 0;">${escapeHtml(code)}</p>
      <p style="color: #6b7c80; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  try {
    await transport.sendMail({
      from: `"Let It Out" <${process.env.EMAIL_USER}>`,
      to,
      subject: `${code} is your Let It Out verification code`,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error(`[email] Failed to send OTP email to ${to}:`, err);
    return false;
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
    "This form goes directly and only to your therapist, and is saved to your private profile in their client records. It is never seen by anyone else at Let It Out, and never shared with any third party — it exists solely between you and your therapist.",
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
        This form goes directly and only to your therapist, and is saved to your private profile in their
        client records. It is <strong>never seen by anyone else at Let It Out</strong>, and never shared with
        any third party — it exists solely between you and your therapist.
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
 * raw answers plus an optional AI-generated prep summary. The caller also
 * persists this as an IntakeSubmission right after a successful send, so
 * it shows up in that client's profile in the therapist portal. Unlike the
 * other senders, a failed send here is surfaced to the caller (returns
 * false) so the client can be told to retry.
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
    "This information is confidential — sent only to you, and saved to this client's profile in your therapist portal.",
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
        Confidential — sent directly and only to you, and saved to this client's profile in your therapist portal. Not visible to anyone else at Let It Out.
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
