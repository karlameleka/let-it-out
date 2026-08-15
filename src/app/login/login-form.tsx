"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function LoginForm({ dict }: { dict: Dictionary }) {
  const [state, formAction, pending] = useActionState(loginAction, undefined);
  const t = dict.auth;
  const f = dict.forms;

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink/80">
          {f.email}
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
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-ink/80">
            {t.password}
          </label>
          <Link href="/forgot-password" className="text-xs font-medium text-brand-600 link-grow">
            {t.forgotPassword}
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t.loggingIn : t.logIn}
      </Button>
    </form>
  );
}
