"use client";

import { useState, useTransition } from "react";
import { updateJournalLockSetting } from "@/lib/journal-actions";
import type { Dictionary } from "@/lib/i18n/dictionary";
import WebAuthnUnlockSettings from "./webauthn-unlock-settings";

export default function JournalLockToggle({
  initialEnabled,
  dict,
}: {
  initialEnabled: boolean;
  dict: Dictionary;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();
  const t = dict.account;

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      const result = await updateJournalLockSetting(next);
      if (!result.success) setEnabled(!next);
    });
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
      {enabled && <WebAuthnUnlockSettings dict={dict.account} />}
    </div>
  );
}
