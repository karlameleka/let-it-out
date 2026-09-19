"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronDown, Circle } from "lucide-react";
import {
  requestEmailVerification,
  verifyEmailVerification,
  resendEmailVerificationOtp,
  completeSignup,
  completeSocialSignup,
  checkSignupEmailAvailable,
  cancelSocialSignup,
} from "@/lib/auth-actions";
import { Button } from "@/components/ui";
import { useCurrency } from "@/lib/currency-context";
import {
  BIRTH_YEARS,
  MONTHS,
  MONTHS_AR,
  daysInMonth,
  GENDERS,
  GENDERS_AR,
  GENDER_CUSTOM,
  GENDER_CUSTOM_AR,
  COUNTRIES,
  COUNTRY_CALLING_CODES,
  PHONE_COUNTRY_CODES,
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
// on the left. A trailing chevron is a different, well-supported technique
// (appearance:none plus an absolutely-positioned icon, no text padding
// involved) — see SelectField below — and is what every dropdown-style
// field in this form uses now, native <select> or custom, so they all read
// as the same control.
const fieldClasses =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-3.5 text-base text-ink outline-none focus:border-brand-500";

const labelClasses = "mb-1 block text-sm font-medium text-ink/80";

/** A native <select> styled to match the custom SearchableSelect /
 * MultiSelectDropdown controls exactly — same box, same trailing chevron —
 * so every dropdown-style field in the form looks like one family. */
function SelectField({
  id,
  name,
  value,
  onChange,
  className = "",
  children,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClasses} appearance-none pr-10 ${className}`}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
        strokeWidth={2}
      />
    </div>
  );
}

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
  value,
  onChange,
}: {
  id: string;
  name: string;
  options: string[];
  placeholder: string;
  noResultsText: string;
  value: string;
  onChange: (value: string) => void;
}) {
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
        className={`${fieldClasses} pr-10`}
      />
      <ChevronDown
        className={`pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40 transition-transform ${open ? "rotate-180" : ""}`}
        strokeWidth={2}
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
                  onChange(o);
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
  value,
  onChange,
}: {
  id: string;
  name: string;
  options: string[];
  optionLabels: string[];
  placeholder: string;
  selectedLabel: (count: number) => string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  function toggle(o: string) {
    onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o]);
  }

  return (
    <div ref={ref} className="relative">
      {value.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`${fieldClasses} flex items-center justify-between gap-2 text-left ${
          value.length === 0 ? "text-ink/45" : "text-ink"
        }`}
      >
        <span className="truncate">{value.length === 0 ? placeholder : selectedLabel(value.length)}</span>
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
                checked={value.includes(o)}
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

type StepId = "name" | "birthday" | "email" | "password" | "country" | "referral" | "interests" | "agree";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const router = useRouter();
  const [completeState, completeAction, completingSignup] = useActionState(completeSignup, undefined);
  const [socialState, socialAction, completingSocial] = useActionState(completeSocialSignup, undefined);
  const t = dict.auth;
  const f = dict.forms;
  const v = dict.validation;
  const isAr = locale === "ar";

  // Page 1: name. Page 2: birthday + gender. Then everything else, each on
  // its own page — mirroring Google's own account-creation flow. A Google
  // signup already knows the name and email (verified by Google), and
  // never sets a password, so those pages are skipped entirely.
  const steps: StepId[] = pendingSocial
    ? ["birthday", "country", "referral", "interests", "agree"]
    : ["name", "birthday", "email", "password", "country", "referral", "interests", "agree"];

  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");
  const [customGender, setCustomGender] = useState("");
  const [country, setCountry] = useState("");
  const { setCountry: setCurrencyCountry } = useCurrency();
  const [phoneCountryCode, setPhoneCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [serviceInterests, setServiceInterests] = useState<string[]>([]);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [consentDataProcessing, setConsentDataProcessing] = useState(false);
  const [consentTelehealth, setConsentTelehealth] = useState(false);
  const [consentTermsOfCare, setConsentTermsOfCare] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [cancelingSocial, setCancelingSocial] = useState(false);

  // Email verification now happens right after the email page, not at the
  // very end — pendingSignupId identifies the PendingSignup row created by
  // requestEmailVerification once the code is confirmed, and is what
  // completeSignup finishes the account from. verifiedSnapshot captures
  // every field that row was created from (name/email/birthday/gender), so
  // going back and changing any of them is detected and forces re-verification.
  const [pendingSignupId, setPendingSignupId] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedSnapshot, setVerifiedSnapshot] = useState<string | null>(null);
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [otpDestination, setOtpDestination] = useState("");
  const [code, setCode] = useState("");
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Keeps the Day dropdown honest when Month/Year change out from under a
  // previously valid choice (e.g. picking Feb after selecting the 31st).
  function handleBirthMonthChange(value: string) {
    setBirthMonth(value);
    const max = daysInMonth(value ? Number(value) : null, birthYear ? Number(birthYear) : null);
    if (birthDay && Number(birthDay) > max) setBirthDay("");
  }
  function handleBirthYearChange(value: string) {
    setBirthYear(value);
    const max = daysInMonth(birthMonth ? Number(birthMonth) : null, value ? Number(value) : null);
    if (birthDay && Number(birthDay) > max) setBirthDay("");
  }

  // Suggests the matching calling code as soon as a country is picked —
  // still freely changeable afterward for e.g. an expat keeping their old
  // number, since it's a separate field from here on.
  function handleCountryChange(value: string) {
    setCountry(value);
    setCurrencyCountry(value);
    const matchingCode = COUNTRY_CALLING_CODES[value];
    if (matchingCode) setPhoneCountryCode(matchingCode);
  }

  function currentIdentitySnapshot() {
    return JSON.stringify({ firstName, lastName, email, birthMonth, birthDay, birthYear, gender, customGender });
  }

  const formAction = pendingSocial ? socialAction : completeAction;
  const pending = pendingSocial ? completingSocial : completingSignup;
  const submitError = pendingSocial ? socialState?.error : completeState?.error;

  function validateStep(id: StepId): string | null {
    switch (id) {
      case "name":
        if (!firstName.trim()) return v.firstNameRequired;
        if (!lastName.trim()) return v.lastNameRequired;
        return null;
      case "birthday": {
        if (!birthMonth || !birthDay || !birthYear) return t.birthDateRequired;
        const month = Number(birthMonth);
        const day = Number(birthDay);
        const year = Number(birthYear);
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
          return t.birthDateInvalid;
        }
        const today = new Date();
        const hadBirthdayThisYear =
          today.getMonth() > month - 1 || (today.getMonth() === month - 1 && today.getDate() >= day);
        const age = today.getFullYear() - year - (hadBirthdayThisYear ? 0 : 1);
        if (age < 13) return t.birthDateTooYoung;
        if (!gender) return t.genderRequired;
        if (gender === GENDER_CUSTOM && !customGender.trim()) return t.customGenderRequired;
        return null;
      }
      case "email":
        if (!EMAIL_RE.test(email.trim())) return v.emailInvalid;
        return null;
      case "password":
        if (password.length < 8) return v.passwordMin8;
        if (!/[A-Z]/.test(password)) return t.passwordNeedsUppercase;
        if (!/[0-9]/.test(password)) return t.passwordNeedsNumber;
        if (!/[^A-Za-z0-9]/.test(password)) return t.passwordNeedsSpecialChar;
        if (password !== confirmPassword) return t.confirmPasswordMismatch;
        return null;
      case "country":
        if (!country.trim()) return t.countryRequired;
        if (!phoneCountryCode || !phoneNumber.trim()) return t.phoneRequired;
        if (phoneNumber.replace(/\D/g, "").length < 6) return t.phoneInvalid;
        return null;
      case "referral":
        if (!referralSource) return t.referralSourceRequired;
        return null;
      case "interests":
        if (serviceInterests.length === 0) return t.serviceInterestsRequired;
        return null;
      default:
        return null;
    }
  }

  async function goNext() {
    const err = validateStep(steps[step]);
    if (err) {
      setStepError(err);
      return;
    }

    if (steps[step] === "email") {
      // Already verified this exact name/email/birthday/gender combination
      // — nothing changed since, so just continue without sending another
      // code.
      if (emailVerified && verifiedSnapshot === currentIdentitySnapshot()) {
        setStepError(null);
        setStep((s) => s + 1);
        return;
      }

      setCheckingEmail(true);
      const availability = await checkSignupEmailAvailable(email);
      if (availability.error) {
        setCheckingEmail(false);
        setStepError(availability.error);
        return;
      }

      const fd = new FormData();
      fd.set("firstName", firstName);
      fd.set("lastName", lastName);
      fd.set("email", email);
      fd.set("birthMonth", birthMonth);
      fd.set("birthDay", birthDay);
      fd.set("birthYear", birthYear);
      fd.set("gender", gender);
      fd.set("customGender", customGender);
      const result = await requestEmailVerification(undefined, fd);
      setCheckingEmail(false);

      if (result && "error" in result) {
        setStepError(result.error);
        return;
      }
      if (result && "pendingSignupId" in result) {
        setPendingSignupId(result.pendingSignupId);
        setOtpDestination(result.destination);
        setCode("");
        setResendMessage(null);
        setAwaitingCode(true);
        setStepError(null);
      }
      return;
    }

    setStepError(null);
    setStep((s) => s + 1);
  }

  async function handleVerifyCode() {
    if (!pendingSignupId) return;
    setVerifyingCode(true);
    const fd = new FormData();
    fd.set("pendingSignupId", pendingSignupId);
    fd.set("code", code);
    const result = await verifyEmailVerification(undefined, fd);
    setVerifyingCode(false);

    if (result && "error" in result) {
      setStepError(result.error ?? v.invalidInput);
      return;
    }

    setEmailVerified(true);
    setVerifiedSnapshot(currentIdentitySnapshot());
    setAwaitingCode(false);
    setStepError(null);
    setStep((s) => s + 1);
  }

  async function handleResendCode() {
    if (!pendingSignupId) return;
    setResendingCode(true);
    const fd = new FormData();
    fd.set("pendingSignupId", pendingSignupId);
    const result = await resendEmailVerificationOtp(undefined, fd);
    setResendingCode(false);

    if (result && "error" in result) {
      setResendMessage(null);
      setStepError(result.error ?? v.invalidInput);
    } else {
      setStepError(null);
      setResendMessage(t.codeResent);
    }
  }

  async function goBack() {
    // Mid-verification on the email page: "Back" means fixing the email
    // rather than leaving it, so it returns to the plain input instead of
    // moving to the previous wizard step.
    if (steps[step] === "email" && awaitingCode) {
      setAwaitingCode(false);
      setStepError(null);
      return;
    }

    if (step === 0) {
      // On a Google/Apple signup's first page there's no earlier step to
      // return to — "Back" here means leaving the social signup entirely
      // (e.g. wrong account, or wanting email/password instead), so it
      // cancels the pending identity and returns to a normal /signup.
      if (pendingSocial) {
        setCancelingSocial(true);
        await cancelSocialSignup();
        return;
      }
      // Same idea for a normal signup's first page: nothing has been
      // submitted yet, so "Back" just leaves the page the way the browser
      // back button would.
      router.back();
      return;
    }
    setStepError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  const stepId = steps[step];
  const isLastStep = stepId === "agree";

  return (
    <div className="space-y-4">
      {pendingSocial && (
        <div className="flex items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50/50 p-3 text-sm text-ink/70">
          <span className="font-medium text-ink/90">{pendingSocial.name}</span>
          <span className="text-ink/40">·</span>
          <span className="truncate">{pendingSocial.email}</span>
        </div>
      )}

      {!pendingSocial && step === 0 && (googleEnabled || appleEnabled) && (
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

      <div className="h-1 w-full overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-300"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>
      <p className="text-xs font-medium text-ink/45">
        {t.stepOf.replace("{current}", String(step + 1)).replace("{total}", String(steps.length))}
      </p>

      <form
        action={formAction}
        onSubmit={(e) => {
          if (!agreedToPolicy) {
            e.preventDefault();
            setStepError(t.agreeToPolicyRequired);
          } else if (!consentDataProcessing) {
            e.preventDefault();
            setStepError(t.consentDataProcessingRequired);
          } else if (!consentTelehealth) {
            e.preventDefault();
            setStepError(t.consentTelehealthRequired);
          } else if (!consentTermsOfCare) {
            e.preventDefault();
            setStepError(t.consentTermsOfCareRequired);
          }
        }}
        className="space-y-4"
      >
        {!pendingSocial && <input type="hidden" name="pendingSignupId" value={pendingSignupId ?? ""} />}
        {!pendingSocial && (
          <div hidden={stepId !== "name"} className="space-y-4">
            <h2 className="font-display text-xl font-medium text-brand-900">{t.nameStepHeading}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className={labelClasses}>
                  {f.firstName}
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={fieldClasses}
                />
              </div>
              <div>
                <label htmlFor="lastName" className={labelClasses}>
                  {f.lastName}
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={fieldClasses}
                />
              </div>
            </div>
          </div>
        )}

        <div hidden={stepId !== "birthday"} className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-medium text-brand-900">{t.birthdayStepHeading}</h2>
            <p className="mt-1 text-sm text-ink/55">{t.birthdaySubheading}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="birthMonth" className="sr-only">{t.month}</label>
              <SelectField id="birthMonth" name="birthMonth" value={birthMonth} onChange={handleBirthMonthChange}>
                <option value="" disabled>{t.month}</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{isAr ? MONTHS_AR[i] : m}</option>
                ))}
              </SelectField>
            </div>
            <div>
              <label htmlFor="birthDay" className="sr-only">{t.day}</label>
              <SelectField id="birthDay" name="birthDay" value={birthDay} onChange={setBirthDay}>
                <option value="" disabled>{t.day}</option>
                {Array.from(
                  { length: daysInMonth(birthMonth ? Number(birthMonth) : null, birthYear ? Number(birthYear) : null) },
                  (_, i) => i + 1,
                ).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </SelectField>
            </div>
            <div>
              <label htmlFor="birthYear" className="sr-only">{t.year}</label>
              <SelectField id="birthYear" name="birthYear" value={birthYear} onChange={handleBirthYearChange}>
                <option value="" disabled>{t.year}</option>
                {BIRTH_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </SelectField>
            </div>
          </div>

          <div>
            <label htmlFor="gender" className={labelClasses}>
              {t.gender}
            </label>
            <SelectField id="gender" name="gender" value={gender} onChange={setGender}>
              <option value="" disabled>{t.gender}</option>
              {GENDERS.map((g, i) => (
                <option key={g} value={g}>{isAr ? GENDERS_AR[i] : g}</option>
              ))}
              <option value={GENDER_CUSTOM}>{isAr ? GENDER_CUSTOM_AR : GENDER_CUSTOM}</option>
            </SelectField>
            {gender === GENDER_CUSTOM && (
              <input
                type="text"
                name="customGender"
                value={customGender}
                onChange={(e) => setCustomGender(e.target.value)}
                placeholder={t.customGenderPlaceholder}
                className={`${fieldClasses} mt-2`}
              />
            )}
          </div>
        </div>

        {!pendingSocial && (
          <>
            <div hidden={stepId !== "email"} className="space-y-4">
              <h2 className="font-display text-xl font-medium text-brand-900">{t.emailStepHeading}</h2>
              {awaitingCode ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 text-sm text-ink/70">
                    {t.otpSentEmail} <span className="font-medium text-ink/90">{otpDestination}</span>
                  </div>
                  <div>
                    <label htmlFor="emailOtpCode" className="sr-only">{t.otpCodeLabel}</label>
                    <input
                      id="emailOtpCode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="••••••"
                      className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-brand-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendingCode}
                    className="text-sm font-medium text-brand-600 link-grow disabled:opacity-50"
                  >
                    {resendingCode ? t.resending : t.resendCode}
                  </button>
                  {resendMessage && <p className="text-xs text-brand-700">{resendMessage}</p>}
                </div>
              ) : (
                <div>
                  <label htmlFor="email" className={labelClasses}>
                    {f.email}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={fieldClasses}
                  />
                </div>
              )}
            </div>

            <div hidden={stepId !== "password"} className="space-y-4">
              <h2 className="font-display text-xl font-medium text-brand-900">{t.passwordStepHeading}</h2>
              <div>
                <label htmlFor="password" className={labelClasses}>
                  {t.password}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={fieldClasses}
                />
              </div>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <PasswordRequirement met={password.length >= 8} label={t.passwordReqLength} />
                <PasswordRequirement met={/[A-Z]/.test(password)} label={t.passwordReqUppercase} />
                <PasswordRequirement met={/[0-9]/.test(password)} label={t.passwordReqNumber} />
                <PasswordRequirement met={/[^A-Za-z0-9]/.test(password)} label={t.passwordReqSpecial} />
              </ul>
            </div>
          </>
        )}

        <div hidden={stepId !== "country"} className="space-y-4">
          <h2 className="font-display text-xl font-medium text-brand-900">{t.countryStepHeading}</h2>
          <div>
            <label htmlFor="country" className="sr-only">{t.country}</label>
            <SearchableSelect
              id="country"
              name="country"
              options={COUNTRIES}
              placeholder={t.searchCountryPlaceholder}
              noResultsText={t.noCountryResults}
              value={country}
              onChange={handleCountryChange}
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className={labelClasses}>
              {f.phone}
            </label>
            <div className="grid grid-cols-[8.5rem_1fr] gap-2">
              <div>
                <label htmlFor="phoneCountryCode" className="sr-only">{t.callingCode}</label>
                <SelectField id="phoneCountryCode" name="phoneCountryCode" value={phoneCountryCode} onChange={setPhoneCountryCode}>
                  <option value="" disabled>{t.callingCode}</option>
                  {PHONE_COUNTRY_CODES.map((p) => (
                    <option key={`${p.country}-${p.code}`} value={p.code}>
                      {p.code} {p.country}
                    </option>
                  ))}
                </SelectField>
              </div>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={fieldClasses}
              />
            </div>
          </div>
        </div>

        <div hidden={stepId !== "referral"} className="space-y-4">
          <h2 className="font-display text-xl font-medium text-brand-900">{t.referralSource}</h2>
          <div>
            <label htmlFor="referralSource" className="sr-only">{t.referralSource}</label>
            <SelectField id="referralSource" name="referralSource" value={referralSource} onChange={setReferralSource}>
              <option value="" disabled>{t.referralSource}</option>
              {REFERRAL_SOURCES.map((r, i) => (
                <option key={r} value={r}>{isAr ? REFERRAL_SOURCES_AR[i] : r}</option>
              ))}
            </SelectField>
          </div>
        </div>

        <div hidden={stepId !== "interests"} className="space-y-4">
          <h2 className="font-display text-xl font-medium text-brand-900">{t.serviceInterests}</h2>
          <div>
            <label htmlFor="serviceInterests" className="sr-only">{t.serviceInterests}</label>
            <MultiSelectDropdown
              id="serviceInterests"
              name="serviceInterests"
              options={SERVICE_INTERESTS}
              optionLabels={isAr ? SERVICE_INTERESTS_AR : SERVICE_INTERESTS}
              placeholder={t.selectServicesPlaceholder}
              selectedLabel={(count) => t.servicesSelectedCount.replace("{count}", String(count))}
              value={serviceInterests}
              onChange={setServiceInterests}
            />
          </div>
        </div>

        <div hidden={stepId !== "agree"} className="space-y-4">
          <h2 className="font-display text-xl font-medium text-brand-900">{t.agreeStepHeading}</h2>
          <label className="flex items-start gap-2.5 text-sm text-ink/70">
            <input
              type="checkbox"
              name="agreedToPolicy"
              checked={agreedToPolicy}
              onChange={(e) => {
                setAgreedToPolicy(e.target.checked);
                if (e.target.checked) setStepError(null);
              }}
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
          <label className="flex items-start gap-2.5 text-sm text-ink/70">
            <input
              type="checkbox"
              name="consentDataProcessing"
              checked={consentDataProcessing}
              onChange={(e) => {
                setConsentDataProcessing(e.target.checked);
                if (e.target.checked) setStepError(null);
              }}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-brand-300 text-brand-600 focus:ring-brand-400"
            />
            <span>
              {t.consentDataProcessingPrefix}{" "}
              <Link href="/legal/data-processing" target="_blank" className="font-medium text-brand-600 link-grow">
                {t.consentDataProcessingLinkText}
              </Link>
              .
            </span>
          </label>
          <label className="flex items-start gap-2.5 text-sm text-ink/70">
            <input
              type="checkbox"
              name="consentTelehealth"
              checked={consentTelehealth}
              onChange={(e) => {
                setConsentTelehealth(e.target.checked);
                if (e.target.checked) setStepError(null);
              }}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-brand-300 text-brand-600 focus:ring-brand-400"
            />
            <span>
              {t.consentTelehealthPrefix}{" "}
              <Link href="/legal/telehealth-consent" target="_blank" className="font-medium text-brand-600 link-grow">
                {t.consentTelehealthLinkText}
              </Link>
              .
            </span>
          </label>
          <label className="flex items-start gap-2.5 text-sm text-ink/70">
            <input
              type="checkbox"
              name="consentTermsOfCare"
              checked={consentTermsOfCare}
              onChange={(e) => {
                setConsentTermsOfCare(e.target.checked);
                if (e.target.checked) setStepError(null);
              }}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-brand-300 text-brand-600 focus:ring-brand-400"
            />
            <span>
              {t.consentTermsOfCarePrefix}{" "}
              <Link href="/legal/terms-of-care" target="_blank" className="font-medium text-brand-600 link-grow">
                {t.consentTermsOfCareLinkText}
              </Link>
              .
            </span>
          </label>
          <PrivacyBadge text={dict.privacyBadge.signup} />
        </div>

        {(stepError || submitError) && <p className="text-sm text-red-600">{stepError || submitError}</p>}

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={goBack} disabled={cancelingSocial} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            {step === 0 && pendingSocial ? t.cancel : t.back}
          </Button>
          {isLastStep ? (
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? t.creatingAccount : t.createAccount}
            </Button>
          ) : stepId === "email" && awaitingCode ? (
            <Button type="button" onClick={handleVerifyCode} disabled={verifyingCode} className="flex-1">
              {verifyingCode ? t.verifying : t.verify}
            </Button>
          ) : (
            <Button type="button" onClick={goNext} disabled={checkingEmail} className="flex-1">
              {checkingEmail ? t.checkingEmail : t.next}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
