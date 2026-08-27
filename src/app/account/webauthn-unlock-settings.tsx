"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Fingerprint } from "lucide-react";
import { browserSupportsWebAuthn, platformAuthenticatorIsAvailable, startRegistration } from "@simplewebauthn/browser";
import {
  hasWebAuthnCredential,
  getWebAuthnRegistrationOptions,
  verifyWebAuthnRegistration,
  removeWebAuthnCredentials,
} from "@/lib/webauthn";
import type { Dictionary } from "@/lib/i18n/dictionary";

type Status = "checking" | "unsupported" | "none" | "registered";

/**
 * Lets a client with the journal lock enabled register their device's Face
 * ID/Touch ID/Windows Hello/fingerprint as a faster way to open it — the
 * unlock ceremony itself lives in journal-lock-gate.tsx, this is just the
 * enroll/remove management UI, and only shown while the lock is on. Browsers
 * or devices without a platform authenticator quietly don't show this at
 * all, since a password remains the only way to unlock either way.
 */
export default function WebAuthnUnlockSettings({ dict }: { dict: Dictionary["account"] }) {
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    (async () => {
      if (!browserSupportsWebAuthn() || !(await platformAuthenticatorIsAvailable())) {
        setStatus("unsupported");
        return;
      }
      const has = await hasWebAuthnCredential();
      setStatus(has ? "registered" : "none");
    })();
  }, []);

  async function addBiometric() {
    setBusy(true);
    setError(null);
    try {
      const optionsResult = await getWebAuthnRegistrationOptions();
      if (!optionsResult.options) {
        setError(optionsResult.error ?? dict.webauthnCouldNotStart);
        return;
      }
      const attestation = await startRegistration({ optionsJSON: optionsResult.options });
      const result = await verifyWebAuthnRegistration(attestation);
      if (result.success) {
        setStatus("registered");
      } else {
        setError(result.error ?? dict.webauthnCouldNotFinish);
      }
    } catch (err) {
      // Covers the user cancelling the OS prompt, or the device having no
      // enrolled biometric/PIN at all — both surface as a thrown DOMException.
      setError(err instanceof Error ? err.message : dict.webauthnCouldNotSetUp);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await removeWebAuthnCredentials(password);
    setBusy(false);
    if (result.success) {
      setStatus("none");
      setRemoving(false);
      setPassword("");
    } else {
      setError(result.error ?? dict.webauthnCouldNotRemove);
    }
  }

  if (status === "checking" || status === "unsupported") return null;

  return (
    <div className="mt-3 rounded-xl border border-brand-100 bg-white px-4 py-3.5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-2.5">
          <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" strokeWidth={2} />
          <div>
            <p className="text-sm font-medium text-ink/80">{dict.webauthnTitle}</p>
            <p className="mt-0.5 text-xs text-ink/50">
              {status === "registered" ? dict.webauthnRegisteredDescription : dict.webauthnUnregisteredDescription}
            </p>
          </div>
        </div>
        {status === "none" && (
          <button
            type="button"
            onClick={addBiometric}
            disabled={busy}
            className="shrink-0 rounded-full border border-brand-200 px-3.5 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 active:bg-brand-50 disabled:opacity-60"
          >
            {busy ? dict.webauthnSettingUp : dict.webauthnSetUp}
          </button>
        )}
        {status === "registered" && !removing && (
          <button
            type="button"
            onClick={() => setRemoving(true)}
            className="shrink-0 text-xs font-medium text-ink/40 hover:text-red-600 active:text-red-600"
          >
            {dict.webauthnRemove}
          </button>
        )}
      </div>

      {removing && (
        <form onSubmit={handleRemove} className="mt-3 flex flex-wrap items-end gap-2 border-t border-brand-100 pt-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
            placeholder={dict.webauthnConfirmPasswordPlaceholder}
            className="min-w-0 flex-1 rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? dict.webauthnRemoving : dict.webauthnRemove}
          </button>
          <button
            type="button"
            onClick={() => {
              setRemoving(false);
              setPassword("");
              setError(null);
            }}
            className="text-xs font-medium text-ink/50 hover:text-ink/70"
          >
            {dict.webauthnCancel}
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
