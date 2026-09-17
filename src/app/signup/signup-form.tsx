"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, Circle } from "lucide-react";
import { requestSignupOtp, verifySignupOtp, resendSignupOtp, completeSocialSignup } from "@/lib/auth-actions";
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
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-3.5 text-base text-ink outline-none focus:border-brand-500";

const labelClasses = "mb-1 block text-sm font-medium text-ink/80";

function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onOutside]);
  return ref;
}

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-2 text-sm ${met ? "text-brand-700" : "text-ink/45"}`}>
      {met ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={2} />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-ink/25" strokeWidth={2} />
      )}
      {label}
    </li>
  );
}

// Country has 190+ options, too many for a plain <select> to be usable.
// A native <datalist> was considered instead of this, but real Safari
// (especially iOS) has long-standing, inconsistent support for its
// dropdown UI, so a hand-built combobox is used instead — same reasoning
// as the native-<select> caution above.
function SearchableSelect({
  id,
  name,
  options,
  placeholder,
  noResultsText,
}: {
  id: string;
  name: string;
  options: string[];
  placeholder: string;
  noResultsText: string;
}) {
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [query, options]);

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={value} />
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        autoComplete="off"
        value={open ? query : value}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className={fieldClasses}
      />
      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-brand-200 bg-white py-1 shadow-lg"
        >
          {filtered.length === 0 && <li className="px-4 py-2 text-sm text-ink/45">{noResultsText}</li>}
          {filtered.map((o) => (
            <li key={o}>
              <button
                type="button"
                role="option"
                aria-selected={o === value}
                onClick={() => {
                  setValue(o);
                  setQuery("");
                  setOpen(false);
                }}
                className={`block w-full px-4 py-2 text-left text-base hover:bg-brand-50 ${
                  o === value ? "bg-brand-50 font-medium text-brand-700" : "text-ink"
                }`}
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Keeps the same closed-field footprint as the other select-style inputs
// instead of an always-expanded checkbox grid, while still letting more
// than one option be picked — each checked option is emitted as its own
// hidden input so the server's formData.getAll("serviceInterests") needs
// no changes.
function MultiSelectDropdown({
  id,
  name,
  options,
  optionLabels,
  placeholder,
  selectedLabel,
}: {
  id: string;
  name: string;
  options: string[];
  optionLabels: string[];
  placeholder: string;
  selectedLabel: (count: number) => string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  function toggle(o: string) {
    setSelected((prev) => (prev.includes(o) ? prev.filter((v) => v !== o) : [...prev, o]));
  }

  return (
    <div ref={ref} className="relative">
      {selected.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`${fieldClasses} flex items-center justify-between gap-2 text-left ${
          selected.length === 0 ? "text-ink/45" : "text-ink"
        }`}
      >
        <span className="truncate">{selected.length === 0 ? placeholder : selectedLabel(selected.length)}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink/40 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-brand-200 bg-white py-1 shadow-lg"
        >
          {options.map((o, i) => (
            <label
              key={o}
              className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-base text-ink/80 hover:bg-brand-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(o)}
                onChange={() => toggle(o)}
                className="h-5 w-5 shrink-0 rounded border-brand-300 text-brand-600 focus:ring-brand-400"
              />
              {optionLabels[i]}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

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
  pendingSocial = null,
}: {
  dict: Dictionary;
  locale: Locale;
  googleEnabled?: boolean;
  appleEnabled?: boolean;
  pendingSocial?: { email: string; name: string } | null;
}) {
  const [otpState, requestOtpAction, requestingOtp] = useActionState(requestSignupOtp, undefined);
  const [socialState, socialAction, completingSocial] = useActionState(completeSocialSignup, undefined);
  const [password, setPassword] = useState("");
  const t = dict.auth;
  const f = dict.forms;
  const isAr = locale === "ar";

  if (!pendingSocial && otpState && "pendingSignupId" in otpState) {
    return <OtpStep pendingSignupId={otpState.pendingSignupId} destination={otpState.destination} dict={dict} />;
  }

  const formAction = pendingSocial ? socialAction : requestOtpAction;
  const pending = pendingSocial ? completingSocial : requestingOtp;
  const error = pendingSocial ? socialState?.error : otpState && "error" in otpState ? otpState.error : undefined;

  return (
    <div className="space-y-4">
      {!pendingSocial && (googleEnabled || appleEnabled) && (
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
        {pendingSocial ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="socialName" className={labelClasses}>
                {f.name}
              </label>
              <input
                id="socialName"
                type="text"
                value={pendingSocial.name}
                disabled
                className={`${fieldClasses} disabled:bg-brand-50 disabled:text-ink/60`}
              />
            </div>
            <div>
              <label htmlFor="socialEmail" className={labelClasses}>
                {f.email}
              </label>
              <input
                id="socialEmail"
                type="text"
                value={pendingSocial.email}
                disabled
                className={`${fieldClasses} disabled:bg-brand-50 disabled:text-ink/60`}
              />
            </div>
          </div>
        ) : (
          <>
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
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClasses}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClasses}>
                {t.confirmPassword}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                className={fieldClasses}
              />
            </div>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              <PasswordRequirement met={password.length >= 8} label={t.passwordReqLength} />
              <PasswordRequirement met={/[A-Z]/.test(password)} label={t.passwordReqUppercase} />
              <PasswordRequirement met={/[0-9]/.test(password)} label={t.passwordReqNumber} />
              <PasswordRequirement met={/[^A-Za-z0-9]/.test(password)} label={t.passwordReqSpecial} />
            </ul>
          </>
        )}

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
            <SearchableSelect
              id="country"
              name="country"
              options={COUNTRIES}
              placeholder={t.searchCountryPlaceholder}
              noResultsText={t.noCountryResults}
            />
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
          <label htmlFor="serviceInterests" className={labelClasses}>
            {t.serviceInterests}
          </label>
          <MultiSelectDropdown
            id="serviceInterests"
            name="serviceInterests"
            options={SERVICE_INTERESTS}
            optionLabels={isAr ? SERVICE_INTERESTS_AR : SERVICE_INTERESTS}
            placeholder={t.selectServicesPlaceholder}
            selectedLabel={(count) => t.servicesSelectedCount.replace("{count}", String(count))}
          />
        </div>

        <label className="flex items-start gap-2.5 text-sm text-ink/70">
          <input
            type="checkbox"
            name="agreedToPolicy"
            required
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-brand-300 text-brand-600 focus:ring-brand-400"
          />
          <span>
            {t.agreeToPolicyPrefix}{" "}
            <Link href="/privacy" target="_blank" className="font-medium text-brand-600 link-grow">
              {dict.footer.privacyPolicy}
            </Link>{" "}
            {t.agreeToPolicyAnd}{" "}
            <Link href="/terms" target="_blank" className="font-medium text-brand-600 link-grow">
              {dict.footer.terms}
            </Link>
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <PrivacyBadge text={dict.privacyBadge.signup} />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t.creatingAccount : t.createAccount}
        </Button>
      </form>
    </div>
  );
}
