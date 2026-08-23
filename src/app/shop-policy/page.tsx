import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { Ribbon } from "@/components/decor";

export const metadata: Metadata = {
  title: "Shop Policy",
  description: "Delivery, shipping, refund, and cancellation policy for Let It Out guided journals.",
};

const LAST_UPDATED = "August 23, 2026";

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

export default function ShopPolicyPage() {
  return (
    <>
      <section className="bg-brand-50 pt-6 pb-10 sm:pt-14 sm:pb-20">
        <Container>
          <Ribbon>Guided journals</Ribbon>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-brand-900 sm:text-5xl">
            Shop Policy
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">
            How delivery, shipping, refunds, and cancellations work when you order a guided journal from Let It Out.
          </p>
          <p className="mt-3 text-sm text-ink/50">Last updated: {LAST_UPDATED}</p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <Section title="Delivery & shipping policy">
            <ul className="list-disc space-y-2 pl-5">
              <li>Orders are processed within 1–2 business days of being placed.</li>
              <li>Within Egypt, orders typically arrive within 3–5 business days of your order being confirmed, for a flat shipping fee of EGP 100 anywhere in the country.</li>
              <li>Outside Egypt, shipping time and cost are confirmed with you directly before your order ships.</li>
              <li>We&apos;ll email you a confirmation when your order is placed, and our team may contact you by phone to confirm delivery details.</li>
              <li>Please double-check your shipping address, governorate/country, and phone number at checkout — we&apos;re not responsible for delivery delays caused by incorrect details.</li>
              <li>Digital (ebook) journals, where offered, are delivered instantly to the email address used at checkout — there&apos;s no physical shipping involved.</li>
            </ul>
          </Section>

          <Section title="Refund & cancellation policy">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Cash on Delivery orders:</strong> you&apos;re not charged until your journal arrives, so you can
                cancel free of charge any time before it ships — just contact us at{" "}
                <a href="mailto:letitoutsupport@gmail.com" className="font-medium text-brand-600 underline">
                  letitoutsupport@gmail.com
                </a>
                .
              </li>
              <li>
                <strong>Card / mobile wallet orders (Paymob):</strong> if you cancel before your order ships, we&apos;ll
                issue a full refund to your original payment method. Refunds typically appear within 5–10 business
                days, depending on your bank or payment provider.
              </li>
              <li>
                <strong>Damaged or incorrect items:</strong> contact us within 7 days of delivery and we&apos;ll
                arrange a replacement or refund at no extra cost to you.
              </li>
              <li>
                <strong>Change of mind after delivery:</strong> since payment on Cash on Delivery orders is collected
                at your door, requests outside the cases above are handled case-by-case — reach out and we&apos;ll do
                our best to make it right.
              </li>
              <li>
                <strong>Digital (ebook) journals:</strong> once a digital journal has been delivered, it can&apos;t be
                cancelled or refunded, since access has already been granted.
              </li>
            </ul>
          </Section>

          <Section title="Questions?">
            <p>
              Reach us at{" "}
              <a href="mailto:letitoutsupport@gmail.com" className="font-medium text-brand-600 underline">
                letitoutsupport@gmail.com
              </a>
              , call{" "}
              <a href="tel:+201288200533" className="font-medium text-brand-600 underline">
                +20 128 8200533
              </a>
              , or reach out through our{" "}
              <a href="/contact" className="font-medium text-brand-600 underline">
                contact page
              </a>
              . This policy sits alongside our{" "}
              <a href="/terms" className="font-medium text-brand-600 underline">
                Terms &amp; Conditions
              </a>
              .
            </p>
          </Section>
        </Container>
      </section>
    </>
  );
}
