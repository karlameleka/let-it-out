import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Container, SectionHeading, ButtonLink } from "@/components/ui";
import { Logo } from "@/components/logo";
import { Ribbon, WaveDivider, DoodleField, Swash } from "@/components/decor";
import { ProductCover, PRODUCT_PHOTOS } from "@/components/product-cover";
import { formatEGP } from "@/lib/format";
import InstallOverlay from "@/components/install-overlay";
import { Reveal } from "@/components/reveal";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getSiteTextOverrides, applyOverrides } from "@/lib/site-text";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ install?: string }>;
}) {
  const [{ install }, counselors, products, locale, overrides] = await Promise.all([
    searchParams,
    prisma.counselor.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { variants: { where: { format: "PHYSICAL" } } },
    }),
    getLocale(),
    getSiteTextOverrides(),
  ]);
  const t = applyOverrides(getDictionary(locale).home, "home", overrides, locale);

  return (
    <>
      <InstallOverlay initialOpen={install === "true"} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-50">
        <DoodleField />
        <Container className="relative pt-14 pb-20 sm:pt-20 sm:pb-28">
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
              <ButtonLink href="/counseling" variant="primary">
                {t.heroCtaBook}
              </ButtonLink>
              <ButtonLink href="/shop" variant="text">
                {t.heroCtaShop} &rarr;
              </ButtonLink>
            </div>
          </div>

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
            <div className="flex items-center gap-4 rounded-lg bg-brand-700 px-6 py-5 text-white sm:max-w-xs">
              <Logo variant="icon-white" height={40} className="shrink-0" />
              <p className="font-display text-base italic leading-snug">{t.heroCardQuote}</p>
            </div>
          </div>
        </Container>
      </section>

      <WaveDivider fill="fill-white" />

      {/* Services */}
      <section className="pb-24 pt-4 sm:pb-28">
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

      {/* Story teaser */}
      <section className="relative overflow-hidden bg-brand-800 py-24 text-white">
        <WaveDivider className="absolute -top-px left-0 -translate-y-full" fill="fill-brand-800" />
        <Image
          src="/brand/logo-icon-white.png"
          alt=""
          width={852}
          height={829}
          className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 opacity-[0.06]"
        />
        <Reveal>
          <Container className="relative grid items-center gap-10 md:grid-cols-2">
            <div>
              <Ribbon tone="dark">{t.storyRibbon}</Ribbon>
              <h2 className="mt-4 font-display text-3xl font-medium sm:text-4xl">
                {t.storyTitle}
              </h2>
              <p className="mt-5 text-brand-50/85">{t.storyDescription}</p>
              <ButtonLink href="/about" variant="bright" className="mt-7">
                {t.storyCta}
              </ButtonLink>
            </div>
            <div className="flex justify-center">
              <Logo variant="icon-white" height={200} className="drop-shadow-xl" />
            </div>
          </Container>
        </Reveal>
      </section>

      {/* Counselors */}
      <section className="py-24">
        <Reveal>
          <Container>
            <SectionHeading
              eyebrow={t.teamEyebrow}
              title={t.teamTitle}
              description={t.teamDescription}
            />
            <div className="mt-14 grid gap-6 sm:grid-cols-3">
              {counselors.map((c) => (
                <Link
                  key={c.id}
                  href={`/counseling/${c.slug}`}
                  className="group rounded-2xl border-[1.5px] border-brand-900 bg-white p-6 transition-colors duration-300 hover:bg-brand-900 active:bg-brand-900"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 font-display text-lg font-semibold text-brand-700 transition-colors duration-300 group-hover:border-white/30 group-active:border-white/30 group-hover:bg-white/10 group-active:bg-white/10 group-hover:text-white group-active:text-white">
                    {c.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-brand-900 transition-colors duration-300 group-hover:text-white group-active:text-white">
                    {c.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink/60 transition-colors duration-300 group-hover:text-white/70 group-active:text-white/70">{c.credentials}</p>
                  <p className="mt-3 text-sm font-medium text-brand-600 link-grow w-fit transition-colors duration-300 group-hover:text-white group-active:text-white">
                    {t.teamViewProfile} &rarr;
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </Reveal>
      </section>

      {/* Shop teaser */}
      <section className="relative overflow-hidden bg-brand-50 py-24">
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

      {/* Journal app CTA */}
      <section className="py-24">
        <Reveal>
          <Container className="relative overflow-hidden rounded-3xl border-2 border-brand-100 bg-white px-6 py-16 text-center sm:px-16">
            <DoodleField />
            <div className="relative">
              <SectionHeading
                align="center"
                eyebrow={t.journalEyebrow}
                title={t.journalTitle}
                description={t.journalDescription}
              />
              <div className="mt-8 flex justify-center gap-4">
                <ButtonLink href="/signup" variant="primary">
                  {t.journalCta}
                </ButtonLink>
              </div>
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
