import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui";
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
    <section className="py-16 sm:py-20">
      <Container className="grid gap-12 md:grid-cols-2">
        <div className="mx-auto w-full max-w-sm">
          {photo ? (
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-[0_18px_30px_-14px_rgba(18,53,67,0.35)]">
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
          <h1 className="font-display text-3xl font-medium text-brand-900">
            {product.title}
          </h1>
          <p className="mt-4 text-ink/70 leading-relaxed">{product.description}</p>

          <div className="mt-8">
            <AddToCartForm
              productSlug={product.slug}
              title={product.title}
              variants={product.variants.map((v) => ({
                id: v.id,
                format: v.format,
                priceEGP: v.priceEGP,
              }))}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
