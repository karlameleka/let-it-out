"use client";

import { useActionState, useState } from "react";
import { changePasswordAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function ChangePasswordForm({ dict, hasPassword = true }: { dict: Dictionary; hasPassword?: boolean }) {
  const [state, formAction, pending] = useActionState(changePasswordAction, undefined);
  const [key, setKey] = useState(0);
  const [lastHandledState, setLastHandledState] = useState(state);
  const t = dict.account;

  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state?.success) setKey((k) => k + 1);
  }

  return (
    <form action={formAction} key={key} className="mt-5 space-y-4">
      {hasPassword && (
        <div>
          <label htmlFor="currentPassword" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">
            {t.currentPassword}
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
          />
        </div>
      )}

      <div>
        <label htmlFor="newPassword" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">
          {t.newPassword}
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">
          {t.confirmNewPassword}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="animate-pop-in text-sm font-medium text-brand-600">{t.passwordUpdated}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? t.updating : t.updatePassword}
      </Button>
    </form>
  );
}
