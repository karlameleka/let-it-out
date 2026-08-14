"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui";
import { AGE_RANGES, GENDERS, COUNTRIES, REFERRAL_SOURCES } from "@/lib/content/geo";

const selectClasses =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";

export default function ProfileForm({
  ageRange,
  gender,
  country,
  referralSource,
}: {
  ageRange: string | null;
  gender: string | null;
  country: string | null;
  referralSource: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, undefined);

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ageRange" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">
            Age range
          </label>
          <select id="ageRange" name="ageRange" defaultValue={ageRange ?? ""} className={selectClasses}>
            <option value="">Prefer not to say</option>
            {AGE_RANGES.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="gender" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">
            Gender
          </label>
          <select id="gender" name="gender" defaultValue={gender ?? ""} className={selectClasses}>
            <option value="">Prefer not to say</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="country" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">
            Country
          </label>
          <select id="country" name="country" defaultValue={country ?? ""} className={selectClasses}>
            <option value="">Prefer not to say</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="referralSource" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/40">
            How did you hear about us?
          </label>
          <select
            id="referralSource"
            name="referralSource"
            defaultValue={referralSource ?? ""}
            className={selectClasses}
          >
            <option value="">Prefer not to say</option>
            {REFERRAL_SOURCES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="animate-pop-in text-sm font-medium text-brand-600">Saved.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
