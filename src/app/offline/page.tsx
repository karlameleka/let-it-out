import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { Container } from "@/components/ui";
import { Ribbon } from "@/components/decor";
import OfflineRetryButton from "@/components/offline-retry-button";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default async function OfflinePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale).offline;

  return (
    <section className="flex min-h-[70vh] items-center bg-brand-50 py-16 sm:py-20">
      <Container className="max-w-xl text-center">
        <Ribbon>{dict.eyebrow}</Ribbon>
        <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <WifiOff className="h-6 w-6" strokeWidth={2} />
        </div>
        <h1 className="mt-6 font-display text-3xl font-medium leading-[1.1] text-brand-900 sm:text-4xl">
          {dict.heading}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink/70">{dict.body}</p>
        <div className="mt-8 flex justify-center">
          <OfflineRetryButton label={dict.retryButton} />
        </div>
      </Container>
    </section>
  );
}
