import { HONEYPOT_FIELD } from "@/lib/anti-spam-shared";

/**
 * Anti-spam honeypot: a field real visitors never see (off-screen, not
 * display:none/visibility:hidden so it still behaves normally for anything
 * that inspects computed layout) or reach by tab, but a bot's generic
 * "fill every input" autofill does. Any value here on submit means spam —
 * see screenSubmission() in anti-spam.ts, which the server action checks
 * first and silently no-ops on a hit rather than surfacing an error (so the
 * bot never learns it was caught).
 */
export default function HoneypotField() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", left: "-9999px", top: "-9999px", height: 0, width: 0, overflow: "hidden" }}
    >
      <label htmlFor={HONEYPOT_FIELD}>Leave this field blank</label>
      <input type="text" id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
    </div>
  );
}
