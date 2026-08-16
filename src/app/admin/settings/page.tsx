import { getSiteSettings, updateSiteSettings } from "@/lib/site-settings";
import { getSiteTextOverrides, updateSiteText } from "@/lib/site-text";
import en from "@/lib/i18n/dictionaries/en";

const HERO_FIELDS: [key: string, label: string][] = [
  ["heroRibbon", "Ribbon text above the headline"],
  ["heroTitlePrefix", "Headline — before the highlighted word"],
  ["heroTitleHighlight", "Headline — highlighted word"],
  ["heroTitleSuffix", "Headline — after the highlighted word"],
  ["heroDescription", "Description paragraph"],
  ["heroCtaBook", "Primary button"],
  ["heroCtaShop", "Secondary link"],
  ["heroPromptQuote", "Today's-prompt quote"],
  ["heroPromptLabel", "Today's-prompt label"],
  ["heroCardQuote", "Dark quote card"],
];

const BUTTON_FIELDS: [key: string, label: string][] = [
  ["service1Cta", "Counseling card button"],
  ["service2Cta", "Workshops card button"],
  ["service3Cta", "Shop card button"],
  ["storyCta", "\"Our story\" section button"],
  ["teamViewProfile", "Counselor card link"],
  ["shopNow", "Shop item link"],
  ["journalCta", "Journal app CTA button"],
];

const NAV_FIELDS: [key: string, label: string][] = [
  ["about", "About"],
  ["counseling", "Counseling"],
  ["workshops", "Workshops"],
  ["shop", "Shop"],
  ["journal", "Journal"],
  ["resources", "Resources"],
  ["bookASession", "\"Book a session\" button"],
];

function TextOverrideField({
  prefix,
  fieldKey,
  label,
  defaultText,
  overrides,
}: {
  prefix: string;
  fieldKey: string;
  label: string;
  defaultText: string;
  overrides: Map<string, string>;
}) {
  const name = `text.${prefix}.${fieldKey}`;
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink/60" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={overrides.get(`${prefix}.${fieldKey}`) ?? ""}
        placeholder={defaultText}
        className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
      />
    </div>
  );
}

export default async function AdminSettingsPage() {
  const [settings, textOverrides] = await Promise.all([getSiteSettings(), getSiteTextOverrides()]);

  return (
    <div className="max-w-3xl space-y-10">
      <div className="max-w-xl space-y-6">
      <p className="text-sm text-ink/60">
        Sitewide toggles — changes apply immediately, no redeploy needed.
      </p>

      <form action={updateSiteSettings} className="space-y-6">
        <div className="rounded-2xl border border-brand-100 bg-white p-5">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="arabicEnabled"
              defaultChecked={settings.arabicEnabled}
              className="mt-0.5 h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-400"
            />
            <span>
              <span className="block text-sm font-semibold text-brand-900">Arabic language</span>
              <span className="mt-0.5 block text-xs text-ink/60">
                Turn off to hide the language switcher and serve every page in English, even for visitors who
                previously chose Arabic. Their choice isn&apos;t lost — turning this back on picks it back up
                automatically.
              </span>
            </span>
          </label>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-5">
          <label className="block text-sm font-semibold text-brand-900" htmlFor="cbtExercisePlacement">
            Cognitive reframing exercise placement
          </label>
          <p className="mt-0.5 text-xs text-ink/60">
            Where the &ldquo;Interactive exercises&rdquo; card sits on the Resources page, relative to the
            article list.
          </p>
          <select
            id="cbtExercisePlacement"
            name="cbtExercisePlacement"
            defaultValue={settings.cbtExercisePlacement}
            className="mt-3 w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="TOP">Above the article list (default)</option>
            <option value="BOTTOM">Below the article list</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)]"
        >
          Save settings
        </button>
      </form>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-brand-900">Homepage &amp; navigation text</h2>
        <p className="mt-1 text-sm text-ink/60">
          Override specific English text on the site without touching code. Leave a field blank to use the
          default shown as its placeholder. These overrides only apply in English — Arabic pages are unaffected.
        </p>

        <form action={updateSiteText} className="mt-5 space-y-8">
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <h3 className="font-display font-semibold text-brand-900">Homepage hero</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {HERO_FIELDS.map(([key, label]) => (
                <TextOverrideField
                  key={key}
                  prefix="home"
                  fieldKey={key}
                  label={label}
                  defaultText={en.home[key as keyof typeof en.home]}
                  overrides={textOverrides}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <h3 className="font-display font-semibold text-brand-900">Homepage button labels</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {BUTTON_FIELDS.map(([key, label]) => (
                <TextOverrideField
                  key={key}
                  prefix="home"
                  fieldKey={key}
                  label={label}
                  defaultText={en.home[key as keyof typeof en.home]}
                  overrides={textOverrides}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <h3 className="font-display font-semibold text-brand-900">Navigation labels</h3>
            <p className="mt-0.5 text-xs text-ink/60">
              Shown in the header menu and the mobile bottom tab bar.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {NAV_FIELDS.map(([key, label]) => (
                <TextOverrideField
                  key={key}
                  prefix="nav"
                  fieldKey={key}
                  label={label}
                  defaultText={en.nav[key as keyof typeof en.nav]}
                  overrides={textOverrides}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="rounded bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)]"
          >
            Save text
          </button>
        </form>
      </div>
    </div>
  );
}
