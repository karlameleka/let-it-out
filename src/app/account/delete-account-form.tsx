"use client";

import { useActionState, useState } from "react";
import { deleteAccountAction } from "@/lib/auth-actions";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function DeleteAccountForm({ dict }: { dict: Dictionary }) {
  const [state, formAction, pending] = useActionState(deleteAccountAction, undefined);
  const [confirming, setConfirming] = useState(false);
  const t = dict.account;

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="mt-5 rounded border-2 border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 active:bg-red-50"
      >
        {t.deleteAccountButton}
      </button>
    );
  }

  return (
    <form action={formAction} className="animate-pop-in mt-5 space-y-4 rounded-xl border-2 border-red-200 bg-red-50 p-5">
      <p className="text-sm font-medium text-red-800">{t.deleteWarning}</p>
      <div>
        <label
          htmlFor="deletePassword"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-red-700/70"
        >
          {t.confirmPasswordLabel}
        </label>
        <input
          id="deletePassword"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-500"
        />
      </div>
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 active:bg-red-700 disabled:opacity-60"
        >
          {pending ? t.deleting : t.permanentlyDelete}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded border border-brand-200 px-5 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:border-brand-300 active:border-brand-300"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
