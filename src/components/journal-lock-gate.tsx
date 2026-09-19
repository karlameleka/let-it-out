"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Fingerprint, Lock } from "lucide-react";
import { browserSupportsWebAuthn, platformAuthenticatorIsAvailable, startAuthentication } from "@simplewebauthn/browser";
import { verifyJournalLock } from "@/lib/journal-actions";
import { hasWebAuthnCredential, getWebAuthnAuthenticationOptions, verifyJournalUnlockBiometric } from "@/lib/webauthn";
import { Button } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/dictionary";

const UNLOCK_KEY = "lio_journal_unlocked";

/** Gates journal content behind either a Face ID/Touch ID-style biometric
 * (when the account has one registered — see account/webauthn-unlock-
 * settings.tsx) or a re-entered password each browser session — mirrors
 * Apple Journal's optional Face ID lock, and like that feature is off by
 * default (`enabled` reflects the user's account setting). Nothing
 * sensitive is fetched until this passes: pages using this gate fetch their
 * data client-side (after mount, inside the gated children), not in the
 * server-rendered initial page. */
export default function JournalLockGate({
  enabled,
  dict,
  children,
}: {
  enabled: boolean;
  dict: Dictionary["journalLock"];
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<"checking" | "locked" | "unlocked">("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const autoAttempted = useRef(false);

  useEffect(() => {
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("unlocked");
      return;
    }
    const unlocked = window.sessionStorage.getItem(UNLOCK_KEY) === "1";
    setStatus(unlocked ? "unlocked" : "locked");
  }, [enabled]);

  async function attemptBiometricUnlock() {
    setBiometricBusy(true);
    setBiometricError(null);
    try {
      const optionsResult = await getWebAuthnAuthenticationOptions();
      if (!optionsResult.options) {
        setBiometricError(optionsResult.error ?? dict.couldntStart);
        return;
      }
      const assertion = await startAuthentication({ optionsJSON: optionsResult.options });
      const result = await verifyJournalUnlockBiometric(assertion);
      if (result.success) {
        window.sessionStorage.setItem(UNLOCK_KEY, "1");
        setStatus("unlocked");
      } else {
        setBiometricError(result.error ?? dict.couldntVerify);
        setShowPasswordForm(true);
      }
    } catch (err) {
      // The user cancelling the OS prompt (or the device having nothing
      // enrolled) throws a NotAllowedError — not a real failure, just fall
      // back to the password form quietly rather than showing an error.
      if (err instanceof Error && err.name === "NotAllowedError") {
        setShowPasswordForm(true);
      } else {
        setBiometricError(err instanceof Error ? err.message : dict.couldntVerify);
        setShowPasswordForm(true);
      }
    } finally {
      setBiometricBusy(false);
    }
  }

  useEffect(() => {
    if (status !== "locked") return;
    (async () => {
      const supported = browserSupportsWebAuthn() && (await platformAuthenticatorIsAvailable());
      if (!supported) return;
      const has = await hasWebAuthnCredential();
      if (!has) return;
      setBiometricAvailable(true);
      // Fire the Face ID/Touch ID prompt immediately on open, same as
      // Apple Journal — only once per mount, so cancelling it (or a
      // subsequent failure) doesn't retrigger the OS prompt on its own.
      if (!autoAttempted.current) {
        autoAttempted.current = true;
        attemptBiometricUnlock();
      }
    })();
  }, [status]);

  async function handleUnlock(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await verifyJournalLock(password);
    setPending(false);
    if (result.success) {
      window.sessionStorage.setItem(UNLOCK_KEY, "1");
      setStatus("unlocked");
    } else {
      setError(result.error ?? dict.incorrectPassword);
    }
  }

  if (status === "checking") return null;

  if (status === "locked") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm rounded-3xl border-2 border-brand-100 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Lock className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <h1 className="mt-4 font-display text-xl font-semibold text-brand-900">{dict.lockedTitle}</h1>
          <p className="mt-1.5 text-sm text-ink/60">
            {biometricAvailable ? dict.useBiometricOrPassword : dict.enterPassword}
          </p>

          {biometricAvailable && !showPasswordForm && (
            <div className="mt-6">
              <Button type="button" onClick={attemptBiometricUnlock} disabled={biometricBusy} className="w-full">
                <Fingerprint className="h-4 w-4" strokeWidth={2} />
                {biometricBusy ? dict.waiting : dict.unlockWithBiometric}
              </Button>
              {biometricError && <p className="mt-2 text-sm text-red-600">{biometricError}</p>}
              <button
                type="button"
                onClick={() => setShowPasswordForm(true)}
                className="mt-3 text-xs font-medium text-ink/50 underline-offset-2 hover:text-brand-600 hover:underline"
              >
                {dict.usePasswordInstead}
              </button>
            </div>
          )}

          {(!biometricAvailable || showPasswordForm) && (
            <form onSubmit={handleUnlock} className="mt-6 space-y-3 text-left">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                placeholder={dict.passwordPlaceholder}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? dict.unlocking : dict.unlock}
              </Button>
              {biometricAvailable && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setError(null);
                  }}
                  className="w-full text-center text-xs font-medium text-ink/50 underline-offset-2 hover:text-brand-600 hover:underline"
                >
                  {dict.useBiometricInstead}
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/** Clears the unlock flag and reloads so the gate re-locks immediately —
 * used by the header's manual "Lock" button. */
export function relockJournal() {
  window.sessionStorage.removeItem(UNLOCK_KEY);
  window.location.reload();
}
