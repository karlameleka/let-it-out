import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Container, SectionHeading } from "@/components/ui";
import { PRODUCT_PHOTOS } from "@/components/product-cover";
import { Ribbon, Swash } from "@/components/decor";
import PriceDisplay from "@/components/price-display";
import { FaqList } from "@/components/faq";
import { Reveal } from "@/components/reveal";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { localizeProduct } from "@/lib/content/products";
import { SHOP_TESTIMONIALS } from "@/lib/testimonials";
import TestimonialCarousel from "@/components/testimonial-carousel";

export const metadata: Metadata = {
  title: "Guided Journals",
  description: "CBT-informed guided journals from Let It Out.",
};

export default async function ShopPage() {
  const [products, locale] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { variants: { where: { format: "PHYSICAL" } } },
    }),
    getLocale(),
  ]);
  const t = getDictionary(locale).shop;

  const SHOP_FAQ = [
    { question: t.faq1Q, answer: t.faq1A },
    { question: t.faq2Q, answer: t.faq2A },
    { question: t.faq3Q, answer: t.faq3A },
  ];

  return (
    <>
      <section
        className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 pt-6 pb-10 text-white sm:pt-14 sm:pb-16"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 94%, 0 100%)" }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-10 left-10 h-40 w-40 rounded-full bg-white/10" />
        <Container className="relative">
          <Ribbon tone="dark">{t.ribbon}</Ribbon>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-white sm:text-5xl">
            {t.titlePrefix}
            <span className="mark-swash italic text-brand-200">
              {t.titleHighlight}<Swash />
            </span>
            {t.titleSuffix}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-50/85">{t.description}</p>
          <p className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-medium text-brand-700">
            {t.soldBadge}
          </p>
        </Container>
      </section>

      <section className="pb-16 pt-2 sm:pb-20">
        <Reveal>
          <Container>
          <SectionHeading eyebrow={t.ourJournalsEyebrow} title={t.ourJournalsTitle} />
          <div data-onboarding="shop-journals" className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2">
            {products.map((rawProduct) => {
              const p = localizeProduct(rawProduct, locale);
              const price = Math.min(...p.variants.map((v) => v.priceEGP));
              const photo = PRODUCT_PHOTOS[p.slug];
              const stockCount = p.variants[0]?.stockCount ?? null;
              const outOfStock = stockCount === 0;
              const lowStock = stockCount !== null && stockCount > 0 && stockCount <= 5;
              return (
                <Link key={p.id} href={`/shop/${p.slug}`} className="group">
                  {photo && (
                    <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-2xl shadow-[0_18px_30px_-14px_rgba(18,53,67,0.35)] transition-transform duration-300 group-hover:-translate-y-1.5 group-active:-translate-y-1.5">
                      <Image
                        src={photo}
                        alt={`${p.title} guided journal`}
                        fill
                        sizes="(max-width: 640px) 90vw, 280px"
                        className="object-cover"
                      />
                      {outOfStock && (
                        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink/60">
                          {t.outOfStock}
                        </span>
                      )}
                      {lowStock && (
                        <span className="absolute left-3 top-3 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                          {t.onlyLeft.replace("{count}", String(stockCount))}
                        </span>
                      )}
                    </div>
                  )}
                  <h3 className="mt-5 text-center font-display text-lg font-semibold text-brand-900 group-hover:text-brand-600 group-active:text-brand-600">
                    {p.title}
                  </h3>
                  <p className="mx-auto mt-1 max-w-xs text-center text-sm text-ink/60">
                    {p.description}
                  </p>
                  <p className="mt-2 text-center text-sm font-medium text-brand-700">
                    <PriceDisplay egpAmount={price} />
                  </p>
                </Link>
              );
            })}
          </div>
          </Container>
        </Reveal>
      </section>

      <section className="bg-brand-50 py-16 sm:py-20">
        <Reveal>
          <Container>
            <SectionHeading eyebrow={t.testimonialsEyebrow} title={t.testimonialsTitle} />
            <div className="mt-10">
              <TestimonialCarousel quotes={SHOP_TESTIMONIALS} />
            </div>
          </Container>
        </Reveal>
      </section>

      <section className="py-16 sm:py-20">
        <Reveal>
          <Container className="max-w-2xl">
            <SectionHeading eyebrow={t.faqEyebrow} title={t.faqTitle} />
            <div className="mt-8">
              <FaqList items={SHOP_FAQ} />
            </div>
          </Container>
        </Reveal>
      </section>
    </>
  );
}
