import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Container, SectionHeading } from "@/components/ui";
import { PRODUCT_PHOTOS } from "@/components/product-cover";
import { Ribbon, Swash, WaveDivider } from "@/components/decor";
import PriceDisplay from "@/components/price-display";

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

  return (
    <>
      <section className="bg-brand-50 py-16 sm:py-20">
        <Container>
          <Ribbon>Guided journals &amp; digital resources</Ribbon>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.1] text-brand-900 sm:text-5xl">
            Self-help tools you can{" "}
            <span className="mark-swash italic text-brand-700">
              hold onto<Swash />
            </span>
            .
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">
            Built on a Cognitive-Behavioral Therapy approach to help you
            build healthier relationships with yourself and those around
            you.
          </p>
        </Container>
      </section>

      <WaveDivider fill="fill-white" />

      <section className="pb-16 pt-4 sm:pb-20">
        <Container>
          <SectionHeading eyebrow="Shop" title="Our journals" />
          <div className="mt-12 grid gap-x-8 gap-y-16 sm:grid-cols-2">
            {products.map((p) => {
              const price = Math.min(...p.variants.map((v) => v.priceEGP));
              const photo = PRODUCT_PHOTOS[p.slug];
              return (
                <Link key={p.id} href={`/shop/${p.slug}`} className="group">
                  {photo && (
                    <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-2xl shadow-[0_18px_30px_-14px_rgba(18,53,67,0.35)] transition-transform duration-300 group-hover:-translate-y-1.5">
                      <Image
                        src={photo}
                        alt={`${p.title} guided journal`}
                        fill
                        sizes="(max-width: 640px) 90vw, 280px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <h3 className="mt-5 text-center font-display text-lg font-semibold text-brand-900 group-hover:text-brand-600">
                    {p.title}
                  </h3>
                  <p className="mx-auto mt-1 max-w-xs text-center text-sm text-ink/60">
                    {p.description}
                  </p>
                  <p className="mt-2 text-center text-sm font-medium text-brand-700">
                    <PriceDisplay egpAmount={price} />
                  </p>
                  <p className="mt-1 text-center text-xs text-ink/50">
                    Cash on Delivery
                  </p>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
