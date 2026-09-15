/** Shared EN/AR text-override field for the `updateSiteText` server action
 * (see site-text.ts) — used on both /admin/settings and /admin/resources.
 * Field names follow the `text.<prefix>.<fieldKey>[.ar]` convention that
 * action reads. */
export default function TextOverrideField({
  prefix,
  fieldKey,
  label,
  defaultText,
  defaultTextAr,
  overrides,
}: {
  prefix: string;
  fieldKey: string;
  label: string;
  defaultText: string;
  defaultTextAr: string;
  overrides: Map<string, string>;
}) {
  const name = `text.${prefix}.${fieldKey}`;
  const nameAr = `${name}.ar`;
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor={name}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <span className="w-6 shrink-0 text-center text-[10px] font-semibold uppercase text-ink/30">EN</span>
        <input
          id={name}
          name={name}
          defaultValue={overrides.get(`${prefix}.${fieldKey}`) ?? ""}
          placeholder={defaultText}
          className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="w-6 shrink-0 text-center text-[10px] font-semibold uppercase text-ink/30">AR</span>
        <input
          id={nameAr}
          name={nameAr}
          dir="rtl"
          defaultValue={overrides.get(`${prefix}.${fieldKey}.ar`) ?? ""}
          placeholder={defaultTextAr}
          className="w-full rounded-lg border border-brand-200 bg-brand-50/40 px-3 py-2 text-right text-sm outline-none focus:border-brand-500"
        />
      </div>
    </div>
  );
}
