"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccountAction } from "@/lib/auth-actions";
import { clearAllEntries } from "@/lib/local-journal";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function DeleteAccountForm({
  dict,
  userId,
  hasPassword = true,
}: {
  dict: Dictionary;
  userId: string;
  hasPassword?: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = dict.account;

  // Called directly (not via <form action>) so this component controls the
  // exact order of operations: the server only deletes the account once the
  // password checks out, and only then do we wipe the local journal store —
  // using <form action> here would let Next's automatic revalidation of
  // /account (which redirects to /login the instant the session is gone)
  // race ahead of and cancel the local cleanup.
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await deleteAccountAction(undefined, formData);
    if (result?.error) {
      setPending(false);
      setError(result.error);
      return;
    }

    await clearAllEntries(userId);
    router.push("/");
  }

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
    <form onSubmit={handleSubmit} className="animate-pop-in mt-5 space-y-4 rounded-xl border-2 border-red-200 bg-red-50 p-5">
      <p className="text-sm font-medium text-red-800">{t.deleteWarning}</p>
      {hasPassword && (
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
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
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
          disabled={pending}
          className="rounded border border-brand-200 px-5 py-2.5 text-sm font-medium text-ink/60 transition-colors hover:border-brand-300 active:border-brand-300"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
