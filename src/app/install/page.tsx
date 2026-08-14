import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { Ribbon, DoodleField } from "@/components/decor";
import InstallCard from "@/components/install-card";

export const metadata: Metadata = {
  title: "Install the App",
  description: "Add Let It Out to your home screen for one-tap access to counseling and journaling.",
};

export default function InstallPage() {
  return (
    <section className="relative overflow-hidden bg-brand-50 py-16 sm:py-24">
      <DoodleField />
      <Container className="relative max-w-lg">
        <div className="text-center">
          <Ribbon>Get the app</Ribbon>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.1] text-brand-900 sm:text-4xl">
            Take Let It Out with you.
          </h1>
        </div>
        <div className="mt-10">
          <InstallCard />
        </div>
      </Container>
    </section>
  );
}
