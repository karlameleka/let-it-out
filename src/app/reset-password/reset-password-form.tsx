"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/lib/auth-actions";
import { Button, ButtonLink } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function ResetPasswordForm({ token, dict }: { token: string; dict: Dictionary["auth"] }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, undefined);

  if (state?.success) {
    return (
      <div className="animate-pop-in space-y-4">
        <p className="text-sm font-medium text-brand-600">{dict.passwordUpdatedText}</p>
        <ButtonLink href="/login">{dict.logIn}</ButtonLink>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-ink/80">
          {dict.newPasswordField}
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-ink/80">
          {dict.confirmNewPasswordField}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? dict.updatingPassword : dict.resetPasswordCta}
      </Button>
    </form>
  );
}
