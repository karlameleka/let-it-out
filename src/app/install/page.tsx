import type { Metadata } from "next";
import { WifiOff, EyeOff, Zap } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";
import { Ribbon, DoodleField, WaveDivider } from "@/components/decor";
import { Reveal } from "@/components/reveal";
import InstallCard from "@/components/install-card";
import InstallPreview from "@/components/install-preview";

export const metadata: Metadata = {
  title: "Install the App",
  description: "Add Let It Out to your home screen for one-tap access to counseling and journaling.",
};

const FOOTNOTE_ITEMS = [
  { icon: WifiOff, text: "Works offline" },
  { icon: EyeOff, text: "Private, discreet icon" },
  { icon: Zap, text: "No app store needed" },
];

export default function InstallPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-brand-50 pt-6 pb-14 sm:pt-14 sm:pb-20">
        <DoodleField />
        <Container className="relative max-w-lg text-center">
          <Ribbon>Get the app</Ribbon>
          <h1 className="mt-4 font-display text-3xl font-medium leading-[1.1] text-brand-900 sm:text-4xl">
            Take Let It Out with you.
          </h1>
          <p className="mt-3 text-sm text-ink/60">
            Add it to your home screen in a few taps — one-tap access to your journal and sessions, no browser
            bar in the way.
          </p>

          <div className="mt-8 text-left">
            <InstallCard />
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
            <SectionHeading align="center" eyebrow="What you'll get" title="A closer look" />
            <div className="mt-12">
              <InstallPreview />
            </div>
          </Container>
        </Reveal>
      </section>
    </>
  );
}
