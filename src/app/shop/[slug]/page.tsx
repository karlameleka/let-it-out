import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  AmbientGlow,
  Badge,
  ButtonLink,
  Container,
  Eyebrow,
  Surface,
  focusRing,
  motionEase,
} from "@/components/ui";
import { ProductCover, PRODUCT_PHOTOS } from "@/components/product-cover";
import AddToCartForm from "./add-to-cart-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return {};
  return { title: product.title, description: product.description };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: { where: { format: "PHYSICAL" } } },
  });
  if (!product || !product.active) notFound();

  const photo = PRODUCT_PHOTOS[product.slug];

  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <AmbientGlow palette="brand" intensity={0.16} className="h-[40rem]" />
      <Container className="relative grid gap-12 md:grid-cols-2 lg:gap-16">
        <div className="mx-auto w-full max-w-sm">
          {photo ? (
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-brand-900/10 shadow-ambient-xl">
              <Image
                src={photo}
                alt={`${product.title} guided journal`}
                fill
                sizes="(max-width: 768px) 90vw, 400px"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <ProductCover slug={product.slug} title={product.title} durationDays={product.durationDays} />
          )}
        </div>

        <div>
          <Eyebrow>Guided journal</Eyebrow>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-brand-900 sm:text-4xl">
            {product.title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {product.durationDays ? (
              <Badge tone="outline">{product.durationDays}-day programme</Badge>
            ) : null}
            <Badge tone="outline">CBT-informed</Badge>
          </div>
          <p className="prose-longform mt-7 text-base text-ink-body">
            {product.description}
          </p>

          <div className="mt-10">
            {product.variants.length > 0 ? (
              <AddToCartForm
                productSlug={product.slug}
                title={product.title}
                variants={product.variants.map((v) => ({
                  id: v.id,
                  format: v.format,
                  priceEGP: v.priceEGP,
                }))}
              />
            ) : (
              /* A product can outlive its variants between print runs — say so
                 rather than rendering a checkout that cannot complete. */
              <Surface tone="tinted" className="p-6">
                <p className="font-display text-lg font-semibold tracking-tight text-brand-900">
                  Out of stock
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
                  This journal is between print runs. Get in touch and
                  we&apos;ll let you know as soon as it&apos;s back.
                </p>
                <ButtonLink href="/contact" className="mt-6" size="sm">
                  Tell me when it&apos;s back
                </ButtonLink>
              </Surface>
            )}
          </div>

          <p className="mt-10 text-sm">
            <Link
              href="/shop"
              className={`link-grow inline-block rounded-md font-medium text-brand-600 ${motionEase} ${focusRing} hover:text-brand-700`}
            >
              &larr; Back to all journals
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
