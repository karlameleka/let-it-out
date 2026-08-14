"use client";

import { useActionState, useState } from "react";
import { changePasswordAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui";

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, undefined);
  const [key, setKey] = useState(0);
  const [lastHandledState, setLastHandledState] = useState(state);

  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state?.success) setKey((k) => k + 1);
  }

  return (
    <form action={formAction} key={key} className="mt-5 space-y-4">
      <div>
        <label htmlFor="currentPassword" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">
          Current password
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

      <div>
        <label htmlFor="newPassword" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">
          New password
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
          Confirm new password
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
        <p className="animate-pop-in text-sm font-medium text-brand-600">Password updated.</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
