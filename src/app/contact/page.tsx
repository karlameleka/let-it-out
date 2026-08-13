import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Let It Out.",
};

export default function ContactPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="grid gap-12 md:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Get in touch"
            title="Let's start your journey to well-being, together."
            description="Have a question about counseling, workshops, or our guided journals? Send us a message and we'll get back to you."
          />
          <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6 text-sm text-ink/70">
            <p>
              Looking to book a counseling session? Visit{" "}
              <Link href="/counseling" className="font-medium text-brand-600 hover:underline">
                Counseling
              </Link>
              .
            </p>
            <p className="mt-2">
              Interested in a workshop for your team or community? Visit{" "}
              <Link href="/workshops" className="font-medium text-brand-600 hover:underline">
                Workshops
              </Link>
              .
            </p>
          </div>
        </div>
        <ContactForm />
      </Container>
    </section>
  );
}
