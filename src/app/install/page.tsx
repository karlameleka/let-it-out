import type { Metadata } from "next";
import { WifiOff, EyeOff, Zap } from "lucide-react";
import { Container } from "@/components/ui";
import { Ribbon, DoodleField } from "@/components/decor";
import InstallCard from "@/components/install-card";
import InstallPreview from "@/components/install-preview";

export const metadata: Metadata = {
  title: "Install the App",
  description: "Add Let It Out to your home screen for one-tap access to counseling and journaling.",
};

const FEATURES = [
  {
    icon: WifiOff,
    title: "Offline access",
    description: "Write journal entries anytime, even without internet.",
  },
  {
    icon: EyeOff,
    title: "Privacy-protected",
    description: "Instant, discreet access right from your home screen.",
  },
  {
    icon: Zap,
    title: "Zero app store download",
    description: "Instant launch with no storage drain.",
  },
];

export default function InstallPage() {
  return (
    <section className="relative overflow-hidden bg-brand-50 py-16 sm:py-24">
      <DoodleField />
      <Container className="relative max-w-3xl">
        <div className="text-center">
          <Ribbon>Get the app</Ribbon>
          <h1 className="mt-4 font-display text-3xl font-medium leading-[1.1] text-brand-900 sm:text-4xl">
            Take Let It Out with you.
          </h1>
        </div>

        <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-brand-100 bg-white p-4 text-center">
              <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="mt-2.5 text-sm font-semibold text-brand-900">{title}</p>
              <p className="mt-1 text-xs leading-snug text-ink/60">{description}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-lg">
          <InstallCard />
        </div>

        <div className="mt-16">
          <InstallPreview />
        </div>
      </Container>
    </section>
  );
}
