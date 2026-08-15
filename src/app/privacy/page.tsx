import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { Ribbon } from "@/components/decor";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Let It Out collects, protects, and handles your personal and mental health data.",
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

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="bg-brand-50 py-16 sm:py-20">
        <Container>
          <Ribbon>Your data, protected</Ribbon>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-brand-900 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">
            Your trust matters to us, especially when it comes to something
            as personal as your mental health. This policy explains, in
            plain language, what information we collect, why, and how we
            keep it safe and confidential.
          </p>
          <p className="mt-3 text-sm text-ink/50">Last updated: {LAST_UPDATED}</p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <div className="rounded-2xl border-2 border-brand-100 bg-brand-50/60 p-6">
            <p className="text-sm font-semibold text-brand-800">
              Our commitment to you
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">
              We know that sharing personal information — especially journal
              entries or details about what brought you to counseling —
              takes trust. We do not sell your data, we do not use tracking
              cookies, and every piece of information you share with us is
              treated as confidential and handled with the same care a
              psychologist-led practice applies to any client record.
            </p>
          </div>

          <Section title="1. Who we are">
            <p>
              Let It Out (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a
              psychologist-led mental health service founded in Egypt in
              2021, offering online counseling, guided journals, a
              journaling app, and corporate/community workshops. This
              policy applies to everyone who uses our website, books a
              session, places an order, or uses our journaling app.
            </p>
          </Section>

          <Section title="2. What information we collect">
            <p>We only collect what we need to provide our services:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Account details:</strong> name, email address, and a
                securely hashed password if you create a journaling account.
              </li>
              <li>
                <strong>Optional demographics:</strong> age range, gender,
                country, and how you heard about us. These are never required
                to sign up or use the app — you can skip them entirely or fill
                them in later from account settings.
              </li>
              <li>
                <strong>Booking information:</strong> name, email, phone
                number, preferred session date/time, and any message you
                choose to share about what you&apos;d like support with.
              </li>
              <li>
                <strong>Workshop inquiries:</strong> organization name,
                contact name, email, phone, and details about the workshop
                you&apos;re interested in.
              </li>
              <li>
                <strong>Orders:</strong> name, email, phone number, shipping
                address, governorate/country, and an optional Google Maps
                link to help our courier find you. We do not collect card or
                bank details — payment is Cash on Delivery.
              </li>
              <li>
                <strong>Journal entries:</strong> the content, mood tags, and
                any photo you attach in our journaling app. This is the most
                sensitive information we hold, and it is treated accordingly
                (see Section 5). You can also turn on an optional password
                lock for the journal from account settings.
              </li>
              <li>
                <strong>Contact messages:</strong> anything you send us
                through our contact form.
              </li>
            </ul>
          </Section>

          <Section title="3. Why we collect it">
            <ul className="list-disc space-y-2 pl-5">
              <li>To schedule and confirm counseling sessions and workshops.</li>
              <li>To process, ship, and confirm journal orders.</li>
              <li>To respond to questions and requests you send us.</li>
              <li>To provide and personalize your journaling app experience.</li>
              <li>To send confirmation emails for bookings, orders, and inquiries.</li>
              <li>To maintain the security and proper functioning of our services.</li>
              <li>
                To understand, in aggregate, who we&apos;re serving so we can
                improve our services — never to advertise to you individually.
              </li>
            </ul>
            <p>
              We do not use your information for advertising, and we do not
              build behavioral profiles for marketing purposes.
            </p>
          </Section>

          <Section title="4. Legal basis for processing">
            <p>
              We process personal data in line with the Egyptian Personal
              Data Protection Law No. 151 of 2020, and — for clients located
              outside Egypt — we aim to follow the same core principles
              found in international data protection frameworks such as the
              GDPR: lawfulness, purpose limitation, data minimization,
              accuracy, storage limitation, and confidentiality. In most
              cases, our basis for processing is your explicit consent
              (given when you use our services) and the need to perform the
              service you&apos;ve requested (e.g. fulfilling an order or
              scheduling a session).
            </p>
          </Section>

          <Section title="5. Confidentiality of counseling and journal content">
            <p>
              Anything you share in a counseling session or write in your
              journal is confidential. Access to journal entries is limited
              to you and to the technical safeguards required to operate
              the service — our team does not read your journal entries as
              a matter of routine.
            </p>
            <p>
              As with any licensed mental health practice, confidentiality
              has narrow legal and ethical limits: we may need to break
              confidentiality if there is an imminent risk of serious harm
              to you or someone else, in cases of suspected abuse of a
              minor, or where disclosure is required by law. Your counselor
              will discuss this with you at the start of your work together.
            </p>
          </Section>

          <Section title="6. Who we share data with">
            <p>
              We do not sell or rent your personal information. We share
              data only with the limited service providers necessary to run
              Let It Out — for example, our email provider (to send you
              booking and order confirmations) and our hosting provider (to
              keep the website running securely). These providers are only
              permitted to use your data to perform the specific service we
              ask of them.
            </p>
          </Section>

          <Section title="7. How long we keep your data">
            <p>
              We keep booking, order, and inquiry records for as long as
              needed to provide our services and meet our legal and
              accounting obligations, and journal entries for as long as
              your account remains active. You can request deletion of your
              data at any time (see Section 9).
            </p>
          </Section>

          <Section title="8. How we protect your data">
            <ul className="list-disc space-y-2 pl-5">
              <li>Passwords are stored using industry-standard one-way hashing — we never store your password in plain text.</li>
              <li>All data is transmitted over encrypted (HTTPS) connections.</li>
              <li>Access to our database and admin tools is restricted to authorized staff only.</li>
              <li>We do not use tracking cookies or third-party advertising trackers. Small pieces of information stored on your own device (such as your cart contents, your selected country, or that you&apos;ve already responded to this consent notice) live in your browser&apos;s local storage, stay on your device, and are never used to track you across other websites.</li>
            </ul>
          </Section>

          <Section title="9. Your rights">
            <p>You have the right to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Ask us what personal data we hold about you.</li>
              <li>Request that we correct inaccurate information.</li>
              <li>Request that we delete your data, subject to any legal retention requirements.</li>
              <li>Withdraw consent to future processing at any time.</li>
              <li>Ask us to export a copy of your data.</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:letitoutsupport@gmail.com" className="font-medium text-brand-600 underline">
                letitoutsupport@gmail.com
              </a>
              . We will respond within a reasonable time.
            </p>
          </Section>

          <Section title="10. International visitors">
            <p>
              We welcome clients and customers from outside Egypt. Wherever
              you&apos;re located, we apply the same confidentiality and
              security standards described in this policy to your data.
            </p>
          </Section>

          <Section title="11. Children&apos;s privacy">
            <p>
              Our journaling app and counseling services are intended for
              users aged 16 and over. If you are under 16, please use our
              services together with a parent or guardian.
            </p>
          </Section>

          <Section title="12. Changes to this policy">
            <p>
              We may update this policy from time to time to reflect
              changes in our practices or for legal reasons. We&apos;ll
              update the &quot;last updated&quot; date above whenever we do.
            </p>
          </Section>

          <Section title="13. Contact us">
            <p>
              Questions about this policy or how we handle your data?
              Reach us at{" "}
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
