import { getSiteSettings, updateSiteSettings } from "@/lib/site-settings";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
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
  );
}
