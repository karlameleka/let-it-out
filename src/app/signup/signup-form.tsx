"use client";

import { useActionState } from "react";
import { requestSignupOtp, verifySignupOtp, resendSignupOtp } from "@/lib/auth-actions";
import { Button } from "@/components/ui";
import {
  BIRTH_YEARS,
  GENDERS,
  GENDERS_AR,
  COUNTRIES,
  REFERRAL_SOURCES,
  REFERRAL_SOURCES_AR,
  SERVICE_INTERESTS,
  SERVICE_INTERESTS_AR,
} from "@/lib/content/geo";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import PrivacyBadge from "@/components/privacy-badge";
import GoogleAuthButton from "@/components/google-auth-button";
import AppleAuthButton from "@/components/apple-auth-button";

// Shared by every field in this form, text inputs and native <select>s
// alike, so the whole flow (name/email/password through the demographic
// questions) reads as one consistent sequence rather than two different
// visual systems. A leading icon + custom select padding was tried here
// before and broke on real Safari: WebKit doesn't reliably honor
// padding-inline-start on native <select> text, so selects stay unstyled
// beyond this.
const fieldClasses =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand-500";

const labelClasses = "mb-1 block text-sm font-medium text-ink/80";

function OtpStep({
  pendingSignupId,
  destination,
  dict,
}: {
  pendingSignupId: string;
  destination: string;
  dict: Dictionary;
}) {
  const [verifyState, verifyAction, verifying] = useActionState(verifySignupOtp, undefined);
  const [resendState, resendAction, resending] = useActionState(resendSignupOtp, undefined);
  const t = dict.auth;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 text-sm text-ink/70">
        {t.otpSentEmail} <span className="font-medium text-ink/90">{destination}</span>
      </div>
      <form action={verifyAction} className="space-y-4">
        <input type="hidden" name="pendingSignupId" value={pendingSignupId} />
        <div>
          <label htmlFor="code" className="sr-only">{t.otpCodeLabel}</label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            placeholder="••••••"
            className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-brand-500"
          />
        </div>
        {verifyState?.error && <p className="text-sm text-red-600">{verifyState.error}</p>}
        <Button type="submit" disabled={verifying} className="w-full">
          {verifying ? t.verifying : t.verifyAndCreateAccount}
        </Button>
      </form>
      <form action={resendAction}>
        <input type="hidden" name="pendingSignupId" value={pendingSignupId} />
        <button
          type="submit"
          disabled={resending}
          className="text-sm font-medium text-brand-600 link-grow disabled:opacity-50"
        >
          {resending ? t.resending : t.resendCode}
        </button>
        {resendState?.error && <p className="mt-1.5 text-xs text-red-600">{resendState.error}</p>}
        {resendState?.success && <p className="mt-1.5 text-xs text-brand-700">{t.codeResent}</p>}
      </form>
    </div>
  );
}

export default function SignupForm({
  dict,
  locale,
  googleEnabled = false,
  appleEnabled = false,
}: {
  dict: Dictionary;
  locale: Locale;
  googleEnabled?: boolean;
  appleEnabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState(requestSignupOtp, undefined);
  const t = dict.auth;
  const f = dict.forms;
  const isAr = locale === "ar";

  if (state && "pendingSignupId" in state) {
    return <OtpStep pendingSignupId={state.pendingSignupId} destination={state.destination} dict={dict} />;
  }

  return (
    <div className="space-y-4">
      {(googleEnabled || appleEnabled) && (
        <>
          <div className="space-y-2.5">
            {appleEnabled && <AppleAuthButton label={t.continueWithApple} />}
            {googleEnabled && <GoogleAuthButton label={t.continueWithGoogle} />}
          </div>
          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-ink/40">
            <span className="h-px flex-1 bg-brand-100" />
            {t.orDivider}
            <span className="h-px flex-1 bg-brand-100" />
          </div>
        </>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="name" className={labelClasses}>
            {f.name}
          </label>
          <input id="name" name="name" type="text" required className={fieldClasses} />
        </div>
        <div>
          <label htmlFor="email" className={labelClasses}>
            {f.email}
          </label>
          <input id="email" name="email" type="email" required className={fieldClasses} />
        </div>
        <div>
          <label htmlFor="password" className={labelClasses}>
            {t.password}
          </label>
          <input id="password" name="password" type="password" required minLength={8} className={fieldClasses} />
          <p className="mt-1 text-xs text-ink/50">{t.passwordHint}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="birthYear" className="sr-only">{t.birthYear}</label>
            <select id="birthYear" name="birthYear" defaultValue="" required className={fieldClasses}>
              <option value="" disabled>{t.birthYear}</option>
              {BIRTH_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="country" className="sr-only">{t.country}</label>
            <select id="country" name="country" defaultValue="" required className={fieldClasses}>
              <option value="" disabled>{t.country}</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="gender" className={labelClasses}>
            {t.gender}
          </label>
          <select id="gender" name="gender" defaultValue="" required className={fieldClasses}>
            <option value="" disabled>{t.gender}</option>
            {GENDERS.map((g, i) => (
              <option key={g} value={g}>{isAr ? GENDERS_AR[i] : g}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="referralSource" className={labelClasses}>
            {t.referralSource}
          </label>
          <select id="referralSource" name="referralSource" defaultValue="" required className={fieldClasses}>
            <option value="" disabled>{t.referralSource}</option>
            {REFERRAL_SOURCES.map((r, i) => (
              <option key={r} value={r}>{isAr ? REFERRAL_SOURCES_AR[i] : r}</option>
            ))}
          </select>
        </div>

        <div>
          <p className={labelClasses}>{t.serviceInterests}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {SERVICE_INTERESTS.map((s, i) => (
              <label key={s} className="flex items-center gap-2.5 text-sm text-ink/80">
                <input
                  type="checkbox"
                  name="serviceInterests"
                  value={s}
                  className="h-4 w-4 shrink-0 rounded border-brand-300 text-brand-600 focus:ring-brand-400"
                />
                {isAr ? SERVICE_INTERESTS_AR[i] : s}
              </label>
            ))}
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
