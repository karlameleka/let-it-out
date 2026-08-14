"use client";

import { useActionState } from "react";
import { signupAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui";
import { AGE_RANGES, GENDERS, COUNTRIES, REFERRAL_SOURCES } from "@/lib/content/geo";

const selectClasses =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500";

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

      <div className="border-t border-brand-100 pt-4">
        <p className="text-sm font-medium text-ink/80">A bit about you</p>
        <p className="mt-0.5 text-xs text-ink/50">
          Totally optional — helps us understand who we&apos;re serving. Skip anything you&apos;d rather not share.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="ageRange" className="mb-1 block text-xs font-medium text-ink/60">
              Age range
            </label>
            <select id="ageRange" name="ageRange" defaultValue="" className={selectClasses}>
              <option value="">Prefer not to say</option>
              {AGE_RANGES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="gender" className="mb-1 block text-xs font-medium text-ink/60">
              Gender
            </label>
            <select id="gender" name="gender" defaultValue="" className={selectClasses}>
              <option value="">Prefer not to say</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="country" className="mb-1 block text-xs font-medium text-ink/60">
              Country
            </label>
            <select id="country" name="country" defaultValue="" className={selectClasses}>
              <option value="">Prefer not to say</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="referralSource" className="mb-1 block text-xs font-medium text-ink/60">
              How did you hear about us?
            </label>
            <select id="referralSource" name="referralSource" defaultValue="" className={selectClasses}>
              <option value="">Prefer not to say</option>
              {REFERRAL_SOURCES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
