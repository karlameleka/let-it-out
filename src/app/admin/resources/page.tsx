import { ArrowDown, ArrowUp } from "lucide-react";
import { getResourceBlocks, RESOURCE_BLOCK_LABELS, toggleResourceBlockHidden, moveResourceBlockUp, moveResourceBlockDown } from "@/lib/resource-blocks";
import { getSiteSettings, updateHiddenArticles } from "@/lib/site-settings";
import { getSiteTextOverrides, updateSiteText } from "@/lib/site-text";
import { getArticles } from "@/lib/content/articles";
import en from "@/lib/i18n/dictionaries/en";
import ar from "@/lib/i18n/dictionaries/ar";
import TextOverrideField from "@/components/text-override-field";
import type { ResourceBlockKind } from "@/generated/prisma/enums";

// Which SiteText override fields (see site-text.ts, prefix "resourcesHome")
// belong to each promo-card block — ARTICLES has none, it's handled by its
// own hidden-article-slugs checklist instead.
const PROMO_FIELDS: Partial<Record<ResourceBlockKind, [key: string, label: string][]>> = {
  JOURNAL_PROMO: [
    ["journalPromoLabel", "Eyebrow label"],
    ["journalPromoTitle", "Title"],
    ["journalPromoDescription", "Body"],
    ["journalPromoCta", "Button text"],
  ],
  CBT_PROMO: [
    ["cbtPromoLabel", "Eyebrow label"],
    ["cbtPromoTitle", "Title"],
    ["cbtPromoDescription", "Body"],
    ["cbtPromoCta", "Button text"],
  ],
  BREATHING_PROMO: [
    ["breathingPromoLabel", "Eyebrow label"],
    ["breathingPromoTitle", "Title"],
    ["breathingPromoDescription", "Body"],
    ["breathingPromoCta", "Button text"],
  ],
  ASSESSMENTS_PROMO: [
    ["assessmentsPromoLabel", "Eyebrow label"],
    ["assessmentsPromoTitle", "Title"],
    ["assessmentsPromoDescription", "Body"],
    ["assessmentsPromoCtaLocked", "Button text (before someone has unlocked any results)"],
  ],
};

export default async function AdminResourcesPage() {
  const [blocks, settings, textOverrides, articleList] = await Promise.all([
    getResourceBlocks(),
    getSiteSettings(),
    getSiteTextOverrides(),
    getArticles(),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-brand-900">Resources page sections</h1>
        <p className="mt-1 text-sm text-ink/60">
          Hide, reorder, or edit the text of each section on the public /resources page, the journal, CBT, and
          breathing promo cards, the My Assessments card, and the article list itself. Changes apply immediately.
        </p>
      </div>

      {blocks.map((block, i) => {
        const fields = PROMO_FIELDS[block.kind];
        const isFirst = i === 0;
        const isLast = i === blocks.length - 1;
        return (
          <div key={block.kind} className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display font-semibold text-brand-900">{RESOURCE_BLOCK_LABELS[block.kind]}</p>
                {block.hidden && (
                  <span className="mt-0.5 inline-block rounded-full bg-ink/5 px-2 py-0.5 text-xs font-medium text-ink/50">
                    Hidden
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <form action={moveResourceBlockUp}>
                  <input type="hidden" name="kind" value={block.kind} />
                  <button
                    type="submit"
                    disabled={isFirst}
                    aria-label="Move up"
                    title="Move up"
                    className="rounded-lg border border-brand-200 p-1.5 text-brand-700 hover:bg-brand-50 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ArrowUp className="h-4 w-4" strokeWidth={2} />
                  </button>
                </form>
                <form action={moveResourceBlockDown}>
                  <input type="hidden" name="kind" value={block.kind} />
                  <button
                    type="submit"
                    disabled={isLast}
                    aria-label="Move down"
                    title="Move down"
                    className="rounded-lg border border-brand-200 p-1.5 text-brand-700 hover:bg-brand-50 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ArrowDown className="h-4 w-4" strokeWidth={2} />
                  </button>
                </form>
                <form action={toggleResourceBlockHidden}>
                  <input type="hidden" name="kind" value={block.kind} />
                  <input type="hidden" name="hidden" value={block.hidden ? "" : "on"} />
                  <button
                    type="submit"
                    className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
                  >
                    {block.hidden ? "Show" : "Hide"}
                  </button>
                </form>
              </div>
            </div>

            {fields && (
              <form action={updateSiteText} className="mt-4 space-y-4 border-t border-brand-100 pt-4">
                {fields.map(([key, label]) => (
                  <TextOverrideField
                    key={key}
                    prefix="resourcesHome"
                    fieldKey={key}
                    label={label}
                    defaultText={en.resourcesHome[key as keyof typeof en.resourcesHome]}
                    defaultTextAr={ar.resourcesHome[key as keyof typeof ar.resourcesHome]}
                    overrides={textOverrides}
                  />
                ))}
                <button
                  type="submit"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Save text
                </button>
              </form>
            )}

            {block.kind === "ARTICLES" && (
              <form action={updateHiddenArticles} className="mt-4 space-y-3 border-t border-brand-100 pt-4">
                <p className="text-xs text-ink/60">
                  Uncheck an article to remove it from this listing, it&rsquo;s still reachable at its direct
                  link, this only archives it here.
                </p>
                <div className="space-y-2">
                  {articleList.map((a) => (
                    <label key={a.slug} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="hiddenArticleSlugs"
                        value={a.slug}
                        defaultChecked={settings.hiddenArticleSlugs.includes(a.slug)}
                        className="mt-0.5 h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-400"
                      />
                      <span className="text-sm text-ink/80">{a.title}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Save article visibility
                </button>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}

