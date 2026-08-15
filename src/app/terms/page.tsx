import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { Ribbon } from "@/components/decor";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of Let It Out's services.",
};

const LAST_UPDATED = "August 14, 2026";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="font-display text-xl font-semibold text-brand-900">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/75">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <>
      <section className="bg-brand-50 py-16 sm:py-20">
        <Container>
          <Ribbon>Please read before you begin</Ribbon>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-brand-900 sm:text-5xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">
            These terms explain how our counseling, workshops, guided
            journals, and journaling app work, and what to expect from us —
            and from you — when using Let It Out.
          </p>
          <p className="mt-3 text-sm text-ink/50">Last updated: {LAST_UPDATED}</p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <div className="rounded-2xl border-2 border-red-100 bg-red-50/60 p-6">
            <p className="text-sm font-semibold text-red-800">
              If you are in crisis
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">
              Let It Out is not an emergency service. If you or someone you
              know is in immediate danger or experiencing a mental health
              crisis, please contact your local emergency services or the
              Egyptian National Crisis Hotline at{" "}
              <a href="tel:16328" className="font-semibold text-red-700 underline">
                16328
              </a>{" "}
              right away.
            </p>
          </div>

          <Section title="1. Acceptance of these terms">
            <p>
              By using our website, booking a session, purchasing a
              journal, or creating a journaling account, you agree to these
              Terms &amp; Conditions and to our{" "}
              <a href="/privacy" className="font-medium text-brand-600 underline">
                Privacy Policy
              </a>
              . If you do not agree, please do not use our services.
            </p>
          </Section>

          <Section title="2. Our services">
            <p>
              Let It Out provides online individual and couples counseling,
              corporate and community workshops, guided self-help journals,
              and a companion journaling app. Our services are offered by
              or under the supervision of licensed mental health
              professionals, but they are not a substitute for emergency
              medical or psychiatric care.
            </p>
          </Section>

          <Section title="3. Eligibility">
            <p>
              You must be at least 18 years old to book counseling or
              create a journaling account on your own behalf. If you are
              between 16 and 18, you may use our services with the
              knowledge and consent of a parent or guardian.
            </p>
          </Section>

          <Section title="4. Booking counseling sessions">
            <ul className="list-disc space-y-2 pl-5">
              <li>Sessions run 50 minutes.</li>
              <li>
                Your preferred date and time on the booking form are a
                request, not a guarantee — we will reach out by email or
                phone to confirm actual availability as soon as possible.
              </li>
              <li>
                If you need to reschedule or cancel, please let us know as
                early as you can so we can offer the slot to someone else.
              </li>
              <li>
                Counseling is a collaborative process; outcomes depend on
                many factors and we cannot guarantee specific results.
              </li>
            </ul>
          </Section>

          <Section title="5. Corporate & community workshops">
            <p>
              Workshop scope, pricing, and scheduling are agreed
              individually with each organization after you submit an
              inquiry. A quote is not a confirmed booking until both
              parties agree in writing (including by email).
            </p>
          </Section>

          <Section title="6. Orders for guided journals">
            <ul className="list-disc space-y-2 pl-5">
              <li>Prices are listed in Egyptian Pounds (EGP). Any other currency shown on the site is an approximate, informational conversion only — you will always be charged the exact EGP amount.</li>
              <li>Payment is currently Cash on Delivery only — you pay in cash when your order arrives.</li>
              <li>Shipping within Egypt is a flat fee of EGP 100, regardless of governorate.</li>
              <li>Shipping outside Egypt is calculated and confirmed with you before your order ships.</li>
              <li>We will email you a confirmation when your order is placed, and our team may contact you to confirm delivery details.</li>
              <li>Please double-check your shipping address, governorate/country, and phone number — we are not responsible for delivery delays caused by incorrect details.</li>
            </ul>
          </Section>

          <Section title="7. Returns & refunds">
            <p>
              If your journal arrives damaged or incorrect, contact us
              within 7 days of delivery at{" "}
              <a href="mailto:letitoutsupport@gmail.com" className="font-medium text-brand-600 underline">
                letitoutsupport@gmail.com
              </a>{" "}
              and we&apos;ll arrange a replacement or refund. Since payment
              is collected on delivery, refunds for other reasons are
              considered on a case-by-case basis — please reach out and
              we&apos;ll do our best to make it right.
            </p>
          </Section>

          <Section title="8. The journaling app">
            <p>
              Your journal entries belong to you. We store them securely
              and treat them as confidential (see our Privacy Policy). The
              journaling app is a self-reflection tool and is not a
              substitute for therapy or professional mental health support.
            </p>
          </Section>

          <Section title="9. Intellectual property">
            <p>
              The Let It Out name, logo, website content, workshop
              materials, and journal designs are the property of Let It Out
              and may not be copied, reproduced, or distributed without our
              written permission.
            </p>
          </Section>

          <Section title="10. Acceptable use">
            <p>
              Please use our website and app respectfully and lawfully. We
              may suspend or terminate access for anyone who misuses our
              services, including attempts to compromise the security of
              our systems or harass our staff or other users.
            </p>
          </Section>

          <Section title="11. Limitation of liability">
            <p>
              To the fullest extent permitted by law, Let It Out is not
              liable for indirect or consequential losses arising from your
              use of our services. Nothing in these terms limits liability
              that cannot be excluded under Egyptian law.
            </p>
          </Section>

          <Section title="12. Governing law">
            <p>
              These terms are governed by the laws of the Arab Republic of
              Egypt. Any disputes will be handled in accordance with
              Egyptian law.
            </p>
          </Section>

          <Section title="13. Changes to these terms">
            <p>
              We may update these terms occasionally to reflect changes in
              our services or legal requirements. We&apos;ll update the
              &quot;last updated&quot; date above whenever we do.
            </p>
          </Section>

          <Section title="14. Contact us">
            <p>
              Questions about these terms? Reach us at{" "}
              <a href="mailto:letitoutsupport@gmail.com" className="font-medium text-brand-600 underline">
                letitoutsupport@gmail.com
              </a>{" "}
              or through our{" "}
              <a href="/contact" className="font-medium text-brand-600 underline">
                contact page
              </a>
              .
            </p>
          </Section>
        </Container>
      </section>
    </>
  );
}
