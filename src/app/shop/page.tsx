import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Container, SectionHeading } from "@/components/ui";
import { ProductCover } from "@/components/product-cover";
import { Ribbon, Swash, WaveDivider } from "@/components/decor";
import { formatEGP } from "@/lib/format";

export const metadata: Metadata = {
  title: "Guided Journals",
  description:
    "CBT-informed guided journals from Let It Out, available as physical books or ebooks.",
};

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { variants: true },
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
            you. Available as a physical journal or an ebook.
          </p>
        </Container>
      </section>

      <WaveDivider fill="fill-white" />

      <section className="pb-16 pt-4 sm:pb-20">
        <Container>
          <SectionHeading eyebrow="Shop" title="Our journals" />
          <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2">
            {products.map((p, i) => {
              const prices = p.variants.map((v) => v.priceEGP);
              const min = Math.min(...prices);
              const max = Math.max(...prices);
              return (
                <Link key={p.id} href={`/shop/${p.slug}`} className="group">
                  <div className={`mx-auto w-full max-w-[220px] transition-transform group-hover:-translate-y-1.5 ${i % 2 === 0 ? "-rotate-2" : "rotate-2"} group-hover:rotate-0`}>
                    <ProductCover slug={p.slug} title={p.title} durationDays={p.durationDays} />
                  </div>
                  <h3 className="mt-5 text-center font-display text-lg font-semibold text-brand-900 group-hover:text-brand-600">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-center text-sm text-ink/60">{p.description}</p>
                  <p className="mt-2 text-center text-sm font-medium text-brand-700">
                    {min === max ? formatEGP(min) : `${formatEGP(min)} – ${formatEGP(max)}`}
                    <span className="ml-2 text-ink/50">· physical or ebook</span>
                  </p>
                  <p className="mt-1 text-center text-xs text-ink/50">
                    Pay via InstaPay or Cash on Delivery
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
