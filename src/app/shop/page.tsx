import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import {
  AmbientGlow,
  Badge,
  ButtonLink,
  Container,
  EmptyState,
  SectionHeading,
  focusRing,
  liftPress,
  motionEase,
} from "@/components/ui";
import { PRODUCT_PHOTOS } from "@/components/product-cover";
import { Ribbon, Swash, DoodleField } from "@/components/decor";
import { BagMark } from "@/components/illustrations";
import PriceDisplay from "@/components/price-display";
import { FaqList } from "@/components/faq";

const SHOP_FAQ = [
  {
    question: "How long does delivery take?",
    answer:
      "Within Egypt, orders typically arrive within 3–5 business days of your order being confirmed, for a flat shipping fee of EGP 100 anywhere in the country. Outside Egypt, shipping time and cost are confirmed with you directly before your order ships.",
  },
  {
    question: "What if my journal arrives damaged or wrong?",
    answer:
      "Contact us within 7 days of delivery and we'll arrange a replacement or refund. Since payment is collected on delivery, other return requests are handled case-by-case — just reach out and we'll sort it out.",
  },
  {
    question: "How do I pay?",
    answer:
      "You'll choose at checkout — pay securely online by card or mobile wallet, or choose Cash on Delivery and pay when your journal arrives.",
  },
];

export const metadata: Metadata = {
  title: "Guided Journals",
  description: "CBT-informed guided journals from Let It Out.",
};

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { variants: { where: { format: "PHYSICAL" } } },
  });

  const sellable = products.filter((p) => p.variants.length > 0);

  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50 via-brand-50/60 to-white py-20 sm:py-28">
        <AmbientGlow palette="brand" intensity={0.2} />
        <DoodleField />
        <Container className="relative">
          <Ribbon>Guided journals &amp; digital resources</Ribbon>
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.14] tracking-tight text-brand-900 sm:text-[3.4rem]">
            Self-help tools you can{" "}
            <span className="mark-swash italic text-brand-700">
              hold onto<Swash />
            </span>
            .
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-body">
            Built on a Cognitive-Behavioral Therapy approach to help you
            build healthier relationships with yourself and those around
            you.
          </p>
        </Container>
      </section>


      <section className="pb-24 pt-6 sm:pb-28">
        <Container>
          <SectionHeading eyebrow="Shop" title="Our journals" />

          {sellable.length === 0 ? (
            <EmptyState
              className="mt-14 max-w-2xl"
              illustration={<BagMark className="h-9 w-9" />}
              title="Restocking right now"
              description="Every journal is between print runs. Leave us a note and we'll tell you the moment they're back — or start with the free daily prompts in the app."
              action={
                <>
                  <ButtonLink href="/journal">Try the journaling app</ButtonLink>
                  <ButtonLink href="/contact" variant="outline">
                    Tell me when it&apos;s back
                  </ButtonLink>
                </>
              }
            />
          ) : (
            <div className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2">
              {sellable.map((p, i) => {
                const price = Math.min(...p.variants.map((v) => v.priceEGP));
                const photo = PRODUCT_PHOTOS[p.slug];
                return (
                  <Link
                    key={p.id}
                    href={`/shop/${p.slug}`}
                    className={`group animate-rise-in block rounded-3xl p-2 ${motionEase} ${liftPress} ${focusRing}`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {photo && (
                      <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-3xl border border-brand-900/10 shadow-ambient-lg transition-shadow duration-300 ease-out group-hover:shadow-ambient-xl">
                        <Image
                          src={photo}
                          alt={`${p.title} guided journal`}
                          fill
                          sizes="(max-width: 640px) 90vw, 280px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h3 className="mt-7 text-center font-display text-xl font-semibold tracking-tight text-brand-900 transition-colors duration-300 ease-out group-hover:text-brand-600">
                      {p.title}
                    </h3>
                    <p className="mx-auto mt-2.5 max-w-xs text-center text-sm leading-relaxed text-ink-muted">
                      {p.description}
                    </p>
                    <p className="mt-4 flex justify-center">
                      <Badge>
                        <PriceDisplay egpAmount={price} />
                      </Badge>
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      <section className="relative overflow-hidden bg-linear-to-b from-brand-50 to-white py-20 sm:py-24">
        <AmbientGlow palette="brand" intensity={0.12} />
        <Container className="relative max-w-2xl">
          <SectionHeading eyebrow="Good to know" title="Frequently asked questions" />
          <div className="mt-10">
            <FaqList items={SHOP_FAQ} />
          </div>
        </Container>
      </section>
    </>
  );
}
