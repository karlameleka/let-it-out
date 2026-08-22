import "server-only";

/**
 * SMS (used for phone OTP at signup) is optional and stays dark until real
 * Twilio credentials are supplied, matching how other optional integrations
 * degrade in this codebase (Google sign-in, email sending). To enable it:
 *
 *   1. Create a Twilio account and buy/verify a sending number.
 *   2. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER
 *      in the environment (.env locally, Vercel project env vars in prod).
 *
 * Until all three are set, isSmsOtpEnabled() returns false and signup only
 * offers email as the OTP channel — no "send code via SMS" option shown.
 */
function getTwilioConfig(): { accountSid: string; authToken: string; fromNumber: string } | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!accountSid || !authToken || !fromNumber) return null;
  return { accountSid, authToken, fromNumber };
}

export function isSmsOtpEnabled(): boolean {
  return getTwilioConfig() !== null;
}

/** Sends a plain-text SMS via the Twilio REST API. Returns false (and logs)
 * on any failure — the caller decides how to surface that to the user. */
export async function sendSms({ to, body }: { to: string; body: string }): Promise<boolean> {
  const config = getTwilioConfig();
  if (!config) {
    console.warn(`[sms] Skipped SMS to ${to} — Twilio not configured.`);
    return false;
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({ To: to, From: config.fromNumber, Body: body }),
      },
    );
    if (!res.ok) {
      console.error(`[sms] Twilio send to ${to} failed: ${res.status} ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[sms] Failed to send SMS to ${to}:`, err);
    return false;
  }
}
