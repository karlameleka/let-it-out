"use client";

import { useActionState } from "react";
import { signupAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui";
import { AGE_RANGES, GENDERS, COUNTRIES, REFERRAL_SOURCES } from "@/lib/content/geo";
import type { Dictionary } from "@/lib/i18n/dictionary";

const selectClasses =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500";

export default function SignupForm({ dict }: { dict: Dictionary }) {
  const [state, formAction, pending] = useActionState(signupAction, undefined);
  const t = dict.auth;
  const f = dict.forms;

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink/80">
          {f.name}
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
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink/80">
          {t.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
        />
        <p className="mt-1 text-xs text-ink/50">{t.passwordHint}</p>
      </div>

      <div className="border-t border-brand-100 pt-4">
        <p className="text-sm font-medium text-ink/80">{t.aboutYouLabel}</p>
        <p className="mt-0.5 text-xs text-ink/50">{t.aboutYouHint}</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="ageRange" className="mb-1 block text-xs font-medium text-ink/60">
              {t.ageRange}
            </label>
            <select id="ageRange" name="ageRange" defaultValue="" className={selectClasses}>
              <option value="">{t.preferNotToSay}</option>
              {AGE_RANGES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="gender" className="mb-1 block text-xs font-medium text-ink/60">
              {t.gender}
            </label>
            <select id="gender" name="gender" defaultValue="" className={selectClasses}>
              <option value="">{t.preferNotToSay}</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="country" className="mb-1 block text-xs font-medium text-ink/60">
              {t.country}
            </label>
            <select id="country" name="country" defaultValue="" className={selectClasses}>
              <option value="">{t.preferNotToSay}</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="referralSource" className="mb-1 block text-xs font-medium text-ink/60">
              {t.referralSource}
            </label>
            <select id="referralSource" name="referralSource" defaultValue="" className={selectClasses}>
              <option value="">{t.preferNotToSay}</option>
              {REFERRAL_SOURCES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t.creatingAccount : t.createAccount}
      </Button>
    </form>
  );
}
