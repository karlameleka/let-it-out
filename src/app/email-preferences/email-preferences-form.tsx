"use client";

import { useActionState } from "react";
import { updateEmailPreferencesAction, type EmailPreferencesFormState } from "@/lib/email-preferences-actions";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function EmailPreferencesForm({
  email,
  token,
  initialOptOut,
  dict,
}: {
  email: string;
  token: string;
  initialOptOut: boolean;
  dict: Dictionary["emailPreferences"];
}) {
  const [state, formAction, pending] = useActionState<EmailPreferencesFormState, FormData>(
    updateEmailPreferencesAction,
    undefined,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="token" value={token} />
      <label className="flex items-start gap-3 rounded-xl border border-brand-100 bg-white p-4 text-sm">
        <input
          type="checkbox"
          name="optOut"
          defaultChecked={initialOptOut}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand-300 text-brand-600 focus:ring-brand-400"
        />
        <span>
          <span className="block font-medium text-ink/90">{dict.optOutLabel}</span>
          <span className="mt-0.5 block text-ink/60">{dict.optOutHint}</span>
        </span>
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-brand-600">{dict.saved}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? dict.saving : dict.saveButton}
      </button>
    </form>
  );
}
