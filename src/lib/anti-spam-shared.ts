// Split out from anti-spam.ts (which is "server-only") so client
// components — the <HoneypotField> in every public form — can reference
// the same field name without pulling in server-only code.

/** Name shared by every public form's hidden honeypot field. Real visitors
 * never see or fill it (off-screen, unreachable by tab); a bot's generic
 * "fill every field" autofill does, so any value here means spam. */
export const HONEYPOT_FIELD = "website";
