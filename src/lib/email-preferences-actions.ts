"use server";

import { verifyEmailPreferencesToken, setNotificationsOptOut } from "@/lib/email-preferences";

export type EmailPreferencesFormState = { error?: string; success?: boolean } | undefined;

/** Public, unauthenticated action behind the /email-preferences page —
 * anyone who clicks the link from their own email lands here with no
 * login. Re-verifies the signed token itself rather than trusting the
 * page's form, since a POST here doesn't otherwise prove the caller owns
 * the address they're trying to change. */
export async function updateEmailPreferencesAction(
  _prevState: EmailPreferencesFormState,
  formData: FormData,
): Promise<EmailPreferencesFormState> {
  const email = String(formData.get("email") || "");
  const token = String(formData.get("token") || "");
  const optOut = formData.get("optOut") === "on";

  if (!email || !token || !verifyEmailPreferencesToken(email, token)) {
    return { error: "This link isn't valid." };
  }

  await setNotificationsOptOut(email, optOut);
  return { success: true };
}
