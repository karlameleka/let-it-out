import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui";
import { formatEGP } from "@/lib/format";
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
        <h1 className="mt-1 font-display text-3xl font-bold text-brand-900">
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
                  {item.titleSnapshot} ({item.formatSnapshot === "PHYSICAL" ? "Physical" : "Ebook"}) × {item.quantity}
                </span>
                <span className="font-medium">{formatEGP(item.unitPriceEGP * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-brand-100 pt-4 text-sm font-semibold">
            <span>Total</span>
            <span>{formatEGP(order.totalEGP)}</span>
          </div>
          {order.needsShipping && order.shippingAddress && (
            <p className="mt-4 text-sm text-ink/60">
              Shipping to: {order.shippingAddress}
            </p>
          )}
        </div>

        {order.status === "PENDING_PAYMENT" && (
          <div className="mt-8 rounded-2xl border border-accent-200 bg-accent-50 p-6">
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

        {order.status !== "PENDING_PAYMENT" && (
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
