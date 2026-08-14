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
}: {
  subject: string;
  lines: { label: string; value: string }[];
}) {
  const transport = getTransporter();
  if (!transport) {
    console.warn(
      `[email] Skipped "${subject}" — EMAIL_USER / EMAIL_APP_PASSWORD not configured.`,
    );
    return;
  }

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
      to: SUPPORT_EMAIL,
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
