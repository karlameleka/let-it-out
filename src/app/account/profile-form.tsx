"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui";
import { AGE_RANGES, GENDERS, COUNTRIES, REFERRAL_SOURCES } from "@/lib/content/geo";
import type { Dictionary } from "@/lib/i18n/dictionary";

const selectClasses =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";

export default function ProfileForm({
  ageRange,
  gender,
  country,
  referralSource,
  dict,
}: {
  ageRange: string | null;
  gender: string | null;
  country: string | null;
  referralSource: string | null;
  dict: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, undefined);
  const t = dict.auth;
  const acc = dict.account;

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ageRange" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">
            {t.ageRange}
          </label>
          <select id="ageRange" name="ageRange" defaultValue={ageRange ?? ""} className={selectClasses}>
            <option value="">{t.preferNotToSay}</option>
            {AGE_RANGES.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="gender" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">
            {t.gender}
          </label>
          <select id="gender" name="gender" defaultValue={gender ?? ""} className={selectClasses}>
            <option value="">{t.preferNotToSay}</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="country" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">
            {t.country}
          </label>
          <select id="country" name="country" defaultValue={country ?? ""} className={selectClasses}>
            <option value="">{t.preferNotToSay}</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="referralSource" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">
            {t.referralSource}
          </label>
          <select
            id="referralSource"
            name="referralSource"
            defaultValue={referralSource ?? ""}
            className={selectClasses}
          >
            <option value="">{t.preferNotToSay}</option>
            {REFERRAL_SOURCES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="animate-pop-in text-sm font-medium text-brand-600">{acc.saved}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? acc.saving : acc.save}
      </Button>
    </form>
  );
}
