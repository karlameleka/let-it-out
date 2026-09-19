"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function ForgotPasswordForm({ dict }: { dict: Dictionary["auth"] }) {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, undefined);

  if (state?.success) {
    return <p className="animate-pop-in text-sm text-ink/70">{dict.resetLinkSentText}</p>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink/80">
          {dict.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? dict.sendingResetLink : dict.sendResetLink}
      </Button>
    </form>
  );
}
