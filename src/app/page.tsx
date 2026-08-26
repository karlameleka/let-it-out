import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Container, SectionHeading, ButtonLink } from "@/components/ui";
import { Logo } from "@/components/logo";
import { Ribbon, WaveDivider, DoodleField, Swash } from "@/components/decor";
import StoryTeaser from "@/components/story-teaser";
import { ProductCover, PRODUCT_PHOTOS } from "@/components/product-cover";
import { formatEGP } from "@/lib/format";
import InstallOverlay from "@/components/install-overlay";
import { Reveal } from "@/components/reveal";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getSiteTextOverrides, applyOverrides } from "@/lib/site-text";
import { getSiteSettings } from "@/lib/site-settings";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ install?: string }>;
}) {
  const [{ install }, products, locale, overrides, settings] = await Promise.all([
    searchParams,
    prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { variants: { where: { format: "PHYSICAL" } } },
    }),
    getLocale(),
    getSiteTextOverrides(),
    getSiteSettings(),
  ]);
  const dict = getDictionary(locale);
  const t = applyOverrides(dict.home, "home", overrides, locale);

  return (
    <>
      <InstallOverlay initialOpen={install === "true"} dict={dict.install} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-50">
        <DoodleField />
        <Container className="relative pt-8 pb-14 sm:pt-20 sm:pb-28">
          <div className="max-w-2xl">
            <Ribbon>{t.heroRibbon}</Ribbon>
            <h1 className="animate-rise mt-6 max-w-xl font-display text-4xl font-medium leading-[1.1] text-brand-900 sm:text-5xl" style={{ animationDelay: "0.08s" }}>
              {t.heroTitlePrefix}
              <span className="mark-swash italic text-brand-700">{t.heroTitleHighlight}<Swash /></span>
              {t.heroTitleSuffix}
            </h1>
            <p className="animate-rise mt-6 max-w-lg text-lg text-ink/70" style={{ animationDelay: "0.18s" }}>
              {t.heroDescription}
            </p>
            <div className="animate-rise mt-9 flex flex-wrap items-center gap-x-8 gap-y-4" style={{ animationDelay: "0.28s" }}>
              <ButtonLink href="/services" variant="primary">
                {t.heroCtaServices}
              </ButtonLink>
            </div>
          </div>

          {!settings.hideJournalTaglineButton && (
            <div
              className="animate-rise mt-16 grid gap-8 border-t border-brand-200 pt-10 sm:grid-cols-[1fr_auto] sm:items-center"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="max-w-md">
                <p className="font-display text-lg italic leading-snug text-brand-900">{t.heroPromptQuote}</p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-500">
                  {t.heroPromptLabel}
                </p>
              </div>
              <Link
                href="/journal"
                className="group flex items-center gap-4 rounded-lg bg-brand-700 px-6 py-5 text-white transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] active:bg-brand-600 active:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] sm:max-w-xs"
              >
                <Logo variant="icon-white" height={40} className="shrink-0" />
                <p className="font-display text-base italic leading-snug">{t.heroCardQuote}</p>
              </Link>
            </div>
          )}
        </Container>
      </section>

      <WaveDivider fill="fill-white" />

      {/* Daily journaling, free */}
      <section className="pb-12 pt-2 sm:pb-14">
        <Reveal>
          <Container>
            <Ribbon>{t.journalEyebrow}</Ribbon>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-medium text-brand-900 sm:text-4xl">
              {t.journalTitle}
            </h2>
            <p className="mt-4 max-w-xl text-ink/70">{t.journalDescription}</p>
            <ButtonLink href="/resources#journal-promo" variant="primary" className="mt-6">
              {t.journalCta}
            </ButtonLink>
          </Container>
        </Reveal>
      </section>

      {/* Story teaser — desktop only; on mobile this content leads the
          About page instead (see about/page.tsx). */}
      <StoryTeaser
        className="hidden sm:block"
        ribbon={t.storyRibbon}
        title={t.storyTitle}
        description={t.storyDescription}
        cta={{ label: t.storyCta, href: "/about" }}
      />

      {/* Services */}
      <section className="relative overflow-hidden bg-brand-50 pb-24 pt-8 sm:pt-14">
        <WaveDivider className="absolute -top-px left-0 -translate-y-full" fill="fill-brand-50" />
        <Reveal>
          <Container>
            <SectionHeading
              eyebrow={t.servicesEyebrow}
              title={t.servicesTitle}
              description={t.servicesDescription}
            />
            <div className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-3">
              <ServiceCard
                index="01"
                href="/counseling"
                title={t.service1Title}
                description={t.service1Description}
                cta={t.service1Cta}
              />
              <ServiceCard
                index="02"
                href="/workshops"
                title={t.service2Title}
                description={t.service2Description}
                cta={t.service2Cta}
                offset
              />
              <ServiceCard
                index="03"
                href="/shop"
                title={t.service3Title}
                description={t.service3Description}
                cta={t.service3Cta}
              />
            </div>
          </Container>
        </Reveal>
      </section>

      {/* Shop teaser */}
      <section className="relative overflow-hidden bg-brand-50 pb-24 pt-8 sm:pt-14">
        <WaveDivider className="absolute -top-px left-0 -translate-y-full" fill="fill-brand-50" />
        <Reveal>
          <Container>
            <SectionHeading
              eyebrow={t.shopEyebrow}
              title={t.shopTitle}
              description={t.shopDescription}
            />
            <div className="mt-14 grid gap-10 sm:grid-cols-2">
              {products.map((p) => {
                const price = Math.min(...p.variants.map((v) => v.priceEGP));
                return (
                  <Link key={p.id} href={`/shop/${p.slug}`} className="group flex items-center gap-6">
                    <div className="relative w-32 shrink-0 overflow-hidden rounded-xl shadow-md transition-transform group-hover:-translate-y-1 group-active:-translate-y-1">
                      {PRODUCT_PHOTOS[p.slug] ? (
                        <div className="relative aspect-[4/5] w-full">
                          <Image
                            src={PRODUCT_PHOTOS[p.slug]}
                            alt={`${p.title} guided journal`}
                            fill
                            sizes="128px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <ProductCover slug={p.slug} title="" durationDays={p.durationDays} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-brand-900">
                        {p.title}
                      </h3>
                      <p className="mt-1 text-sm text-ink/60">
                        {formatEGP(price)}
                      </p>
                      <p className="mt-2 text-sm font-medium text-brand-600 link-grow w-fit">
                        {t.shopNow} &rarr;
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </Reveal>
      </section>
    </>
  );
}

function ServiceCard({
  index,
  href,
  title,
  description,
  cta,
  offset,
}: {
  index: string;
  href: string;
  title: string;
  description: string;
  cta: string;
  offset?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col rounded-2xl border-[1.5px] border-brand-900 bg-white p-7 transition-colors duration-300 hover:bg-brand-900 active:bg-brand-900 ${offset ? "sm:mt-8" : ""}`}
    >
      <span className="font-display text-4xl font-semibold text-brand-100 transition-colors duration-300 group-hover:text-white/10 group-active:text-white/10">
        {index}
      </span>
      <h3 className="mt-2 font-display text-lg font-semibold text-brand-900 transition-colors duration-300 group-hover:text-white group-active:text-white">{title}</h3>
      <p className="mt-3 flex-1 text-sm text-ink/70 transition-colors duration-300 group-hover:text-white/70 group-active:text-white/70">{description}</p>
      <p className="mt-4 text-sm font-medium text-brand-600 link-grow w-fit transition-colors duration-300 group-hover:text-white group-active:text-white">
        {cta} &rarr;
      </p>
    </Link>
  );
}
