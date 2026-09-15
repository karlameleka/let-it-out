"use client";

import { useActionState, useState } from "react";
import { UserRound, Compass } from "lucide-react";
import { requestSignupOtp, verifySignupOtp, resendSignupOtp } from "@/lib/auth-actions";
import { Button, Eyebrow } from "@/components/ui";
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

// Plain, unstyled native <select> — matching the sitewide convention used
// everywhere else (checkout, etc.). A leading icon + custom padding was
// tried here before and broke on real Safari: WebKit doesn't reliably
// honor padding-inline-start on native <select> text, so the icon and
// the option text overlapped. Native form controls stay unstyled.
const selectClasses =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-brand-500";

function Pill({
  checked,
  children,
  ...props
}: { checked: boolean; children: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label
      className={`cursor-pointer rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-300 ease-out ${
        checked
          ? "border-brand-600 bg-white text-brand-800 shadow-sm shadow-brand-900/10"
          : "border-brand-200 bg-white/60 text-ink/60 hover:border-brand-400 hover:shadow-[0_0_0_4px_rgba(30,91,115,0.08)]"
      }`}
    >
      <input {...props} checked={checked} className="sr-only" />
      {children}
    </label>
  );
}

function OtpStep({
  pendingSignupId,
  channel,
  destination,
  dict,
}: {
  pendingSignupId: string;
  channel: "EMAIL" | "PHONE";
  destination: string;
  dict: Dictionary;
}) {
  const [verifyState, verifyAction, verifying] = useActionState(verifySignupOtp, undefined);
  const [resendState, resendAction, resending] = useActionState(resendSignupOtp, undefined);
  const t = dict.auth;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 text-sm text-ink/70">
        {channel === "EMAIL" ? t.otpSentEmail : t.otpSentPhone}{" "}
        <span className="font-medium text-ink/90">{destination}</span>
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
  smsOtpEnabled = false,
}: {
  dict: Dictionary;
  locale: Locale;
  googleEnabled?: boolean;
  smsOtpEnabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState(requestSignupOtp, undefined);
  const [interests, setInterests] = useState<string[]>([]);
  const [gender, setGender] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [otpChannel, setOtpChannel] = useState<"EMAIL" | "PHONE">("EMAIL");
  const t = dict.auth;
  const f = dict.forms;
  const isAr = locale === "ar";

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  }

  if (state && "pendingSignupId" in state) {
    return (
      <OtpStep
        pendingSignupId={state.pendingSignupId}
        channel={state.channel}
        destination={state.destination}
        dict={dict}
      />
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
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-ink/80">
            {f.phone}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
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

        {smsOtpEnabled ? (
          <div>
            <p className="mb-1.5 text-xs font-medium text-ink/60">{t.otpChannelLabel}</p>
            <div className="flex gap-2">
              <Pill
                type="radio"
                name="otpChannel"
                value="EMAIL"
                checked={otpChannel === "EMAIL"}
                onChange={() => setOtpChannel("EMAIL")}
              >
                {t.otpChannelEmail}
              </Pill>
              <Pill
                type="radio"
                name="otpChannel"
                value="PHONE"
                checked={otpChannel === "PHONE"}
                onChange={() => setOtpChannel("PHONE")}
              >
                {t.otpChannelPhone}
              </Pill>
            </div>
          </div>
        ) : (
          <input type="hidden" name="otpChannel" value="EMAIL" />
        )}

        <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
          <Eyebrow>{t.aboutYouLabel}</Eyebrow>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="birthYear" className="sr-only">{t.birthYear}</label>
              <select id="birthYear" name="birthYear" defaultValue="" required className={selectClasses}>
                <option value="" disabled>{t.birthYear}</option>
                {BIRTH_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="country" className="sr-only">{t.country}</label>
              <select id="country" name="country" defaultValue="" required className={selectClasses}>
                <option value="" disabled>{t.country}</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink/60">
              <UserRound className="h-3.5 w-3.5 text-brand-400" strokeWidth={2} />
              {t.gender}
            </p>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g, i) => (
                <Pill
                  key={g}
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={() => setGender(g)}
                >
                  {isAr ? GENDERS_AR[i] : g}
                </Pill>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink/60">
              <Compass className="h-3.5 w-3.5 text-brand-400" strokeWidth={2} />
              {t.referralSource}
            </p>
            <div className="flex flex-wrap gap-2">
              {REFERRAL_SOURCES.map((r, i) => (
                <Pill
                  key={r}
                  type="radio"
                  name="referralSource"
                  value={r}
                  checked={referralSource === r}
                  onChange={() => setReferralSource(r)}
                >
                  {isAr ? REFERRAL_SOURCES_AR[i] : r}
                </Pill>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-xs font-medium text-ink/60">{t.serviceInterests}</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_INTERESTS.map((s, i) => (
                <Pill
                  key={s}
                  type="checkbox"
                  name="serviceInterests"
                  value={s}
                  checked={interests.includes(s)}
                  onChange={() => toggleInterest(s)}
                >
                  {isAr ? SERVICE_INTERESTS_AR[i] : s}
                </Pill>
              ))}
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
