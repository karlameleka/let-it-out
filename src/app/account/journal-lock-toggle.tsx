"use client";

import { useState, useTransition } from "react";
import { updateJournalLockSetting } from "@/lib/journal-actions";

export default function JournalLockToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      const result = await updateJournalLockSetting(next);
      if (!result.success) setEnabled(!next);
    });
  }

  return (
    <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3.5">
      <div>
        <p className="text-sm font-medium text-ink/80">Require password to open your journal</p>
        <p className="mt-0.5 text-xs text-ink/50">
          Off by default. When on, you&apos;ll re-enter your password each time you open the journal in a new tab.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Require password to open your journal"
        onClick={toggle}
        disabled={pending}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
          enabled ? "bg-brand-600" : "bg-brand-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
