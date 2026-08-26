import type { Metadata } from "next";
import { WifiOff, EyeOff, Zap } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";
import { Ribbon, DoodleField, WaveDivider } from "@/components/decor";
import { Reveal } from "@/components/reveal";
import InstallCard from "@/components/install-card";
import InstallPreview from "@/components/install-preview";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Install the App",
  description: "Add Let It Out to your home screen for one-tap access to counseling and journaling.",
};

export default async function InstallPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).install;

  const FOOTNOTE_ITEMS = [
    { icon: WifiOff, text: t.footnoteOffline },
    { icon: EyeOff, text: t.footnotePrivate },
    { icon: Zap, text: t.footnoteNoStore },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-brand-50 pt-6 pb-14 sm:pt-14 sm:pb-20">
        <DoodleField />
        <Container className="relative max-w-lg text-center">
          <Ribbon>{t.ribbon}</Ribbon>
          <h1 className="mt-4 font-display text-3xl font-medium leading-[1.1] text-brand-900 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-3 text-sm text-ink/60">{t.description}</p>

          <div className="mt-8 text-left">
            <InstallCard dict={t} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-ink/40">
            {FOOTNOTE_ITEMS.map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-1.5">
                <Icon className="h-3 w-3" strokeWidth={2} />
                {text}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <WaveDivider fill="fill-white" />

      <section className="pt-4 pb-16 sm:pb-24">
        <Reveal>
          <Container>
            <SectionHeading align="center" eyebrow={t.whatYoullGet} title={t.closerLook} />
            <div className="mt-12">
              <InstallPreview dict={t} />
            </div>
          </Container>
        </Reveal>
      </section>
    </>
  );
}
