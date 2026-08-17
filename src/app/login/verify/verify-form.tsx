"use client";

import { useActionState } from "react";
import { verifyTwoFactorAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui";

export default function VerifyTwoFactorForm() {
  const [state, formAction, pending] = useActionState(verifyTwoFactorAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="code" className="mb-1 block text-sm font-medium text-ink/80">
          Code
        </label>
        <input
          id="code"
          name="code"
          inputMode="text"
          autoComplete="one-time-code"
          autoFocus
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm tracking-widest outline-none focus:border-brand-500"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Verifying…" : "Verify"}
      </Button>
    </form>
  );
}
