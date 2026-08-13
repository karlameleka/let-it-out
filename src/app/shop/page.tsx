import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Container, SectionHeading, Eyebrow } from "@/components/ui";
import { ProductCover } from "@/components/product-cover";
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
          <Eyebrow>Guided journals &amp; digital resources</Eyebrow>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold text-brand-900 sm:text-5xl">
            Practical self-help tools you can hold onto.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">
            Built on a Cognitive-Behavioral Therapy approach to help you
            build healthier relationships with yourself and those around
            you. Available as a physical journal or an ebook.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading eyebrow="Shop" title="Our journals" />
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {products.map((p) => {
              const prices = p.variants.map((v) => v.priceEGP);
              const min = Math.min(...prices);
              const max = Math.max(...prices);
              return (
                <Link key={p.id} href={`/shop/${p.slug}`} className="group">
                  <ProductCover title={p.title} durationDays={p.durationDays} />
                  <h3 className="mt-4 font-display text-lg font-semibold text-brand-800 group-hover:text-brand-600">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-sm text-ink/60">{p.description}</p>
                  <p className="mt-2 text-sm font-medium text-brand-700">
                    {min === max ? formatEGP(min) : `${formatEGP(min)} – ${formatEGP(max)}`}
                    <span className="ml-2 text-ink/50">· physical or ebook</span>
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
