import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui";
import { formatEGP } from "@/lib/format";
import PriceDisplay from "@/components/price-display";
import PaymentForm from "./payment-form";

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAYMENT_SUBMITTED: "Payment submitted — pending confirmation",
  CONFIRMED: "Payment confirmed",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  const instapayLink = process.env.INSTAPAY_LINK ?? "";
  const instapayHandle = process.env.INSTAPAY_HANDLE ?? "";

  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-medium text-brand-600">Order #{order.id.slice(-8).toUpperCase()}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-brand-900">
          {order.status === "PENDING_PAYMENT" ? "Complete your payment" : "Thank you for your order"}
        </h1>
        <p className="mt-2 inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
          {STATUS_LABEL[order.status] ?? order.status}
        </p>

        <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6">
          <h2 className="font-display font-semibold text-brand-800">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-ink/70">
                  {item.titleSnapshot} × {item.quantity}
                </span>
                <span className="font-medium">{formatEGP(item.unitPriceEGP * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-brand-100 pt-4 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatEGP(order.subtotalEGP)}</span>
            </div>
            {order.needsShipping && (
              <div className="flex justify-between text-ink/70">
                <span>Shipping</span>
                <span>
                  {order.country === "Egypt"
                    ? formatEGP(order.shippingFeeEGP)
                    : "Calculated upon delivery"}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-brand-100 pt-2 font-semibold">
              <span>Total</span>
              <span><PriceDisplay egpAmount={order.totalEGP} /></span>
            </div>
          </div>
          {order.needsShipping && order.shippingAddress && (
            <div className="mt-4 space-y-1 text-sm text-ink/60">
              <p>
                Shipping to: {order.shippingAddress}
                {order.governorate ? `, ${order.governorate}` : ""}
                {order.country ? `, ${order.country}` : ""}
              </p>
              {order.googleMapsLink && (
                <p>
                  <a
                    href={order.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-600 underline"
                  >
                    View location on Google Maps
                  </a>
                </p>
              )}
              {order.country && order.country !== "Egypt" && (
                <p>
                  Shipping outside Egypt is calculated upon delivery — we&apos;ll
                  confirm the fee with you before shipping.
                </p>
              )}
            </div>
          )}
        </div>

        {order.paymentMethod === "INSTAPAY" && order.status === "PENDING_PAYMENT" && (
          <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <h2 className="font-display font-semibold text-brand-900">
              Pay via InstaPay
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink/80">
              <li>
                Send <strong>{formatEGP(order.totalEGP)}</strong> via InstaPay to{" "}
                <strong>{instapayHandle}</strong>, or use{" "}
                <a
                  href={instapayLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-700 underline"
                >
                  this InstaPay link
                </a>
                .
              </li>
              <li>Copy the transaction reference from your InstaPay receipt.</li>
              <li>Submit it below so we can confirm your order.</li>
            </ol>

            <div className="mt-6">
              <PaymentForm orderId={order.id} />
            </div>
          </div>
        )}

        {order.paymentMethod === "CASH_ON_DELIVERY" && (
          <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <h2 className="font-display font-semibold text-brand-900">
              Cash on Delivery
            </h2>
            <p className="mt-3 text-sm text-ink/80">
              No payment needed now — have <strong>{formatEGP(order.totalEGP)}</strong> in
              cash ready and pay when your journal is delivered. Our team
              will reach out to confirm delivery details.
            </p>
          </div>
        )}

        {!(order.paymentMethod === "INSTAPAY" && order.status === "PENDING_PAYMENT") && (
          <p className="mt-8 text-sm text-ink/60">
            A confirmation has been sent to {order.guestEmail}. If you have
            any questions about your order, please{" "}
            <a href="/contact" className="font-medium text-brand-600 underline">
              contact us
            </a>
            .
          </p>
        )}
      </div>
    </Container>
  );
}
