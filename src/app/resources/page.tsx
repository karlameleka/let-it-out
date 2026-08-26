import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, Wind } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";
import { Ribbon, Swash, WaveDivider } from "@/components/decor";
import { JournalIcon } from "@/components/lio-icons";
import ArticleFilter from "./article-filter";
import { Reveal } from "@/components/reveal";
import { getSiteSettings } from "@/lib/site-settings";
import { getArticles, localizeArticle } from "@/lib/content/articles";
import { getCurrentUser } from "@/lib/session";
import { getMyAssignedResources } from "@/lib/client-resources";
import MyToolsItem from "./my-tools-item";
import MyToolsViewedTracker from "./my-tools-viewed-tracker";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Resources",
  description: "Short, science-backed reads on stress management and healthy self-care habits from Let It Out.",
};

export default async function ResourcesPage() {
  const [settings, rawArticleList, user, locale] = await Promise.all([
    getSiteSettings(),
    getArticles(),
    getCurrentUser(),
    getLocale(),
  ]);
  const myTools = user ? await getMyAssignedResources(user.email) : [];
  const articleList = rawArticleList.map((a) => localizeArticle(a, locale));
  const dict = getDictionary(locale);
  const t = dict.resourcesHome;

  const journalPromo = settings.resourcesPromoHidden ? null : (
    <section className="pt-2 pb-8 sm:py-10 scroll-mt-24" id="journal-promo" key="journal-promo">
      <Reveal>
        <Container>
          <SectionHeading eyebrow={t.practiceEyebrow} title={t.practiceTitle} />
          <Link
            href="/journal"
            className="group mt-10 flex flex-col gap-6 overflow-hidden rounded-3xl border-2 border-brand-700 bg-brand-700 p-6 text-white shadow-sm transition-all hover:-translate-y-1 active:-translate-y-1 hover:shadow-lg active:shadow-lg sm:flex-row sm:items-center sm:p-8"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <JournalIcon className="h-7 w-7" />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">{t.journalPromoLabel}</p>
              <h3 className="mt-1 font-display text-xl font-semibold">{t.journalPromoTitle}</h3>
              <p className="mt-1.5 text-sm text-brand-50/85">{t.journalPromoDescription}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold link-grow w-fit">
              {t.journalPromoCta} <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </span>
          </Link>
        </Container>
      </Reveal>
    </section>
  );

  const cbtPromo = (
    <section className="pt-2 pb-8 sm:py-10" key="cbt-promo">
      <Reveal>
        <Container>
          <Link
            href="/resources/cbt-exercises"
            className="group flex flex-col gap-6 overflow-hidden rounded-3xl border-2 border-brand-900 bg-brand-900 p-6 text-white shadow-sm transition-all hover:-translate-y-1 active:-translate-y-1 hover:shadow-lg active:shadow-lg sm:flex-row sm:items-center sm:p-8"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Brain className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-200">{t.cbtPromoLabel}</p>
              <h3 className="mt-1 font-display text-xl font-semibold">{t.cbtPromoTitle}</h3>
              <p className="mt-1.5 text-sm text-brand-50/85">{t.cbtPromoDescription}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold link-grow w-fit">
              {t.cbtPromoCta} <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </span>
          </Link>
        </Container>
      </Reveal>
    </section>
  );

  const breathingPromo = (
    <section className="pt-2 pb-8 sm:py-10" key="breathing-promo">
      <Reveal>
        <Container>
          <Link
            href="/resources/breathing"
            className="group flex flex-col gap-6 overflow-hidden rounded-3xl border-2 border-brand-600 bg-brand-600 p-6 text-white shadow-sm transition-all hover:-translate-y-1 active:-translate-y-1 hover:shadow-lg active:shadow-lg sm:flex-row sm:items-center sm:p-8"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Wind className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-100">{t.breathingPromoLabel}</p>
              <h3 className="mt-1 font-display text-xl font-semibold">{t.breathingPromoTitle}</h3>
              <p className="mt-1.5 text-sm text-brand-50/85">{t.breathingPromoDescription}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold link-grow w-fit">
              {t.breathingPromoCta} <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </span>
          </Link>
        </Container>
      </Reveal>
    </section>
  );

  const articles = (
    <section className="pt-2 pb-8 sm:py-10" key="articles">
      <Reveal>
        <Container>
          <SectionHeading eyebrow={t.readEyebrow} title={t.latestArticlesTitle} />
          <ArticleFilter
            articles={articleList}
            hiddenSlugs={settings.hiddenArticleSlugs}
            dict={dict.articleFilter}
            progressDict={dict.articleProgressBadge}
          />
        </Container>
      </Reveal>
    </section>
  );

  const sections =
    settings.resourcesPromoPlacement === "BOTTOM"
      ? [articles, journalPromo, cbtPromo, breathingPromo]
      : [journalPromo, cbtPromo, breathingPromo, articles];

  const myToolsSection = user ? (
    <section className="pt-2 pb-8 sm:py-10" key="my-tools" id="my-tools">
      <MyToolsViewedTracker hasUnviewed={myTools.some((item) => !item.viewedAt)} />
      <Reveal>
        <Container>
          <SectionHeading eyebrow={t.myToolsEyebrow} title={t.myToolsTitle} />
          {myTools.length === 0 ? (
            <p className="mt-6 text-sm text-ink/60">{t.myToolsEmpty}</p>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {myTools.map((item) => (
                <MyToolsItem key={item.id} item={item} dict={dict.myTools} />
              ))}
            </div>
          )}
        </Container>
      </Reveal>
    </section>
  ) : null;

  return (
    <>
      <section className="bg-brand-50 pt-6 pb-4 sm:pt-14 sm:pb-20">
        <Container>
          <Ribbon>{t.ribbon}</Ribbon>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-brand-900 sm:text-5xl">
            {t.heroTitlePrefix}{" "}
            <span className="mark-swash italic text-brand-700">
              {t.heroTitleHighlight}
              <Swash />
            </span>
            .
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">{t.heroDescription}</p>
        </Container>
      </section>

      <WaveDivider fill="fill-white" />

      {myToolsSection}

      {sections}
    </>
  );
}
