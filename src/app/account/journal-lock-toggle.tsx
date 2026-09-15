"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updateJournalLockSetting } from "@/lib/journal-actions";
import type { Dictionary } from "@/lib/i18n/dictionary";
import WebAuthnUnlockSettings from "./webauthn-unlock-settings";

export default function JournalLockToggle({
  initialEnabled,
  dict,
  hasPassword = true,
}: {
  initialEnabled: boolean;
  dict: Dictionary;
  hasPassword?: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();
  const [confirmingOff, setConfirmingOff] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const t = dict.account;

  function toggle() {
    if (enabled) {
      // Turning off removes protection, so it needs the account password
      // first (skipped for a Google-only account with no password to
      // confirm with) — turning on never needs confirmation.
      if (hasPassword) {
        setError(null);
        setConfirmingOff(true);
        return;
      }
      applyChange(false);
      return;
    }
    applyChange(true);
  }

  function applyChange(next: boolean, confirmPassword?: string) {
    setEnabled(next);
    startTransition(async () => {
      const result = await updateJournalLockSetting(next, confirmPassword);
      if (!result.success) {
        setEnabled(!next);
        if (next === false) {
          setError(result.error ?? t.lockToggleIncorrectPassword);
          return;
        }
      }
      setConfirmingOff(false);
      setPassword("");
      setError(null);
    });
  }

  function handleConfirmOff(e: FormEvent) {
    e.preventDefault();
    applyChange(false, password);
  }

  return (
    <div>
      <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3.5">
        <div>
          <p className="text-sm font-medium text-ink/80">{t.lockToggleLabel}</p>
          <p className="mt-0.5 text-xs text-ink/50">{t.lockToggleDescription}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={t.lockToggleLabel}
          onClick={toggle}
          disabled={pending}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
            enabled ? "bg-brand-600" : "bg-brand-200"
          }`}
        >
          <span
            className={`absolute top-0.5 start-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
              enabled ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0 rtl:translate-x-0"
            }`}
          />
        </button>
      </div>

      {confirmingOff && (
        <form
          onSubmit={handleConfirmOff}
          className="animate-pop-in mt-2 flex flex-wrap items-end gap-2 rounded-xl border border-brand-100 bg-white px-4 py-3.5"
        >
          <div className="min-w-0 flex-1">
            <label htmlFor="journalLockOffPassword" className="mb-1 block text-xs text-ink/60">
              {t.lockToggleOffConfirmPrompt}
            </label>
            <input
              id="journalLockOffPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {t.lockToggleTurnOff}
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmingOff(false);
              setPassword("");
              setError(null);
            }}
            className="text-xs font-medium text-ink/50 hover:text-ink/70"
          >
            {t.cancel}
          </button>
          {error && <p className="w-full text-xs text-red-600">{error}</p>}
        </form>
      )}

      {enabled && <WebAuthnUnlockSettings dict={dict.account} />}
    </div>
  );
}
