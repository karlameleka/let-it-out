import type { Locale } from "@/lib/i18n/locale";

/** Picks the Arabic title/description when the locale is "ar" and a
 * translation has actually been entered, falling back to English for
 * whichever field hasn't been translated yet. */
export function localizeProduct<T extends { title: string; description: string; titleAr?: string | null; descriptionAr?: string | null }>(
  product: T,
  locale: Locale,
): T {
  if (locale !== "ar") return product;
  return {
    ...product,
    title: product.titleAr || product.title,
    description: product.descriptionAr || product.description,
  };
}
