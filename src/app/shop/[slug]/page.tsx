import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui";
import { ProductCover } from "@/components/product-cover";
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
    include: { variants: { orderBy: { format: "asc" } } },
  });
  if (!product || !product.active) notFound();

  return (
    <section className="py-16 sm:py-20">
      <Container className="grid gap-12 md:grid-cols-2">
        <div className="mx-auto w-full max-w-sm -rotate-1">
          <ProductCover slug={product.slug} title={product.title} durationDays={product.durationDays} />
        </div>

        <div>
          <h1 className="font-display text-3xl font-semibold text-brand-900">
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

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              Pay with InstaPay
            </span>
            <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              Cash on Delivery available
            </span>
          </div>

          <p className="mt-4 text-xs text-ink/50">
            Physical journals ship once your order is confirmed — pay
            upfront via InstaPay, or in cash when it arrives. Ebooks are
            delivered by email after payment is confirmed.
          </p>
        </div>
      </Container>
    </section>
  );
}
