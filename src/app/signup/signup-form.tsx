"use client";

import { useActionState, useState } from "react";
import { Cake, UserRound, Globe, Compass } from "lucide-react";
import { signupAction } from "@/lib/auth-actions";
import { Button, Eyebrow } from "@/components/ui";
import { BIRTH_YEARS, GENDERS, COUNTRIES, REFERRAL_SOURCES, SERVICE_INTERESTS } from "@/lib/content/geo";
import type { Dictionary } from "@/lib/i18n/dictionary";
import PrivacyBadge from "@/components/privacy-badge";
import GoogleAuthButton from "@/components/google-auth-button";

const selectClasses =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";

export default function SignupForm({ dict, googleEnabled = false }: { dict: Dictionary; googleEnabled?: boolean }) {
  const [state, formAction, pending] = useActionState(signupAction, undefined);
  const [interests, setInterests] = useState<string[]>([]);
  const t = dict.auth;
  const f = dict.forms;

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  }

  return (
    <div className="space-y-4">
      {googleEnabled && (
        <>
          <GoogleAuthButton label={t.continueWithGoogle} />
          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-ink/40">
            <span className="h-px flex-1 bg-brand-100" />
            {t.orDivider}
            <span className="h-px flex-1 bg-brand-100" />
          </div>
        </>
      )}

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

        <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
          <Eyebrow>{t.aboutYouLabel}</Eyebrow>
          <p className="mt-2 text-xs text-ink/50">{t.aboutYouHint}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="birthYear" className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink/60">
                <Cake className="h-3.5 w-3.5 text-brand-400" strokeWidth={2} />
                {t.birthYear}
              </label>
              <select id="birthYear" name="birthYear" defaultValue="" required className={selectClasses}>
                <option value="" disabled>{t.selectPlaceholder}</option>
                {BIRTH_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="gender" className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink/60">
                <UserRound className="h-3.5 w-3.5 text-brand-400" strokeWidth={2} />
                {t.gender}
              </label>
              <select id="gender" name="gender" defaultValue="" required className={selectClasses}>
                <option value="" disabled>{t.selectPlaceholder}</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="country" className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink/60">
                <Globe className="h-3.5 w-3.5 text-brand-400" strokeWidth={2} />
                {t.country}
              </label>
              <select id="country" name="country" defaultValue="" required className={selectClasses}>
                <option value="" disabled>{t.selectPlaceholder}</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="referralSource" className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink/60">
                <Compass className="h-3.5 w-3.5 text-brand-400" strokeWidth={2} />
                {t.referralSource}
              </label>
              <select id="referralSource" name="referralSource" defaultValue="" required className={selectClasses}>
                <option value="" disabled>{t.selectPlaceholder}</option>
                {REFERRAL_SOURCES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 block text-xs font-medium text-ink/60">{t.serviceInterests}</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_INTERESTS.map((s) => {
                const inputId = `service-${s.toLowerCase().replace(/\s+/g, "-")}`;
                const checked = interests.includes(s);
                return (
                  <label
                    key={s}
                    htmlFor={inputId}
                    className={`cursor-pointer rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-300 ease-out ${
                      checked
                        ? "border-brand-600 bg-white text-brand-800 shadow-sm shadow-brand-900/10"
                        : "border-brand-200 bg-white/60 text-ink/60 hover:border-brand-400 hover:shadow-[0_0_0_4px_rgba(30,91,115,0.08)]"
                    }`}
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      name="serviceInterests"
                      value={s}
                      checked={checked}
                      onChange={() => toggleInterest(s)}
                      className="sr-only"
                    />
                    {s}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <PrivacyBadge text={dict.privacyBadge.signup} />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t.creatingAccount : t.createAccount}
        </Button>
      </form>
    </div>
  );
}
