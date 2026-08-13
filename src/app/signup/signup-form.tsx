"use client";

import { useActionState } from "react";
import { signupAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink/80">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink/80">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink/80">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
        />
        <p className="mt-1 text-xs text-ink/50">At least 8 characters.</p>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
