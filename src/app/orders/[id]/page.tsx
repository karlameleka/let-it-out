import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui";
import { formatEGP } from "@/lib/format";
import PriceDisplay from "@/components/price-display";
import PaymentForm from "./payment-form";
import RetryPaymobPayment from "./retry-paymob-payment";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, locale] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
    getLocale(),
  ]);
  if (!order) notFound();

  const fullDict = getDictionary(locale);
  const t = fullDict.orderStatus;

  const STATUS_LABEL: Record<string, string> = {
    PENDING_PAYMENT: t.statusPendingPayment,
    PAYMENT_SUBMITTED: t.statusPaymentSubmitted,
    CONFIRMED: t.statusConfirmed,
    SHIPPED: t.statusShipped,
    COMPLETED: t.statusCompleted,
    CANCELLED: t.statusCancelled,
  };

  const instapayLink = process.env.INSTAPAY_LINK ?? "";
  const instapayHandle = process.env.INSTAPAY_HANDLE ?? "";

  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-medium text-brand-600">
          {t.orderNumber.replace("{id}", order.id.slice(-8).toUpperCase())}
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium text-brand-900">
          {order.status === "PENDING_PAYMENT" ? t.titleCompletePayment : t.titleThankYou}
        </h1>
        <p className="mt-2 inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
          {STATUS_LABEL[order.status] ?? order.status}
        </p>

        <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6">
          <h2 className="font-display font-semibold text-brand-800">{t.orderSummary}</h2>
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
              <span>{t.subtotal}</span>
              <span>{formatEGP(order.subtotalEGP)}</span>
            </div>
            {order.discountEGP > 0 && (
              <div className="flex justify-between text-brand-700">
                <span>{t.discount}</span>
                <span>-{formatEGP(order.discountEGP)}</span>
              </div>
            )}
            {order.needsShipping && (
              <div className="flex justify-between text-ink/70">
                <span>{t.shipping}</span>
                <span>
                  {order.country === "Egypt"
                    ? formatEGP(order.shippingFeeEGP)
                    : t.calculatedUponDelivery}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-brand-100 pt-2 font-semibold">
              <span>{t.total}</span>
              <span><PriceDisplay egpAmount={order.totalEGP} /></span>
            </div>
          </div>
          {order.needsShipping && order.shippingAddress && (
            <div className="mt-4 space-y-1 text-sm text-ink/60">
              <p>
                {t.shippingTo.replace(
                  "{address}",
                  `${order.shippingAddress}${order.governorate ? `, ${order.governorate}` : ""}${order.country ? `, ${order.country}` : ""}`,
                )}
              </p>
              {order.googleMapsLink && (
                <p>
                  <a
                    href={order.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-600 underline"
                  >
                    {t.viewOnMaps}
                  </a>
                </p>
              )}
              {order.country && order.country !== "Egypt" && <p>{t.shippingOutsideNote}</p>}
            </div>
          )}
        </div>

        {order.paymentMethod === "INSTAPAY" && order.status === "PENDING_PAYMENT" && (
          <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <h2 className="font-display font-semibold text-brand-900">{t.instapayHeading}</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink/80">
              <li>
                {t.instapayStep1
                  .replace("{amount}", formatEGP(order.totalEGP))
                  .replace("{handle}", instapayHandle)}{" "}
                <a
                  href={instapayLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-700 underline"
                >
                  {t.instapayLinkText}
                </a>
                .
              </li>
              <li>{t.instapayStep2}</li>
              <li>{t.instapayStep3}</li>
            </ol>

            <div className="mt-6">
              <PaymentForm orderId={order.id} dict={t} />
            </div>
          </div>
        )}

        {order.paymentMethod === "PAYMOB" && order.status === "PENDING_PAYMENT" && (
          <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <h2 className="font-display font-semibold text-brand-900">{t.paymobPendingHeading}</h2>
            <p className="mt-3 text-sm text-ink/80">{t.paymobPendingText}</p>
            <div className="mt-6">
              <RetryPaymobPayment orderId={order.id} amountEGP={order.totalEGP} dict={fullDict.paymentSelector} />
            </div>
          </div>
        )}

        {order.paymentMethod === "PAYMOB" && order.status === "CONFIRMED" && (
          <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <h2 className="font-display font-semibold text-brand-900">{t.paymobConfirmedHeading}</h2>
            <p className="mt-3 text-sm text-ink/80">
              {t.paymobConfirmedText.replace("{amount}", formatEGP(order.totalEGP))}
            </p>
          </div>
        )}

        {order.paymentMethod === "CASH_ON_DELIVERY" && (
          <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
            <h2 className="font-display font-semibold text-brand-900">{t.codHeading}</h2>
            <p className="mt-3 text-sm text-ink/80">
              {t.codText.replace("{amount}", formatEGP(order.totalEGP))}
            </p>
          </div>
        )}

        {!(
          (order.paymentMethod === "INSTAPAY" || order.paymentMethod === "PAYMOB") &&
          order.status === "PENDING_PAYMENT"
        ) && (
          <p className="mt-8 text-sm text-ink/60">
            {t.confirmationSent.replace("{email}", order.guestEmail)}{" "}
            <a href="/contact" className="font-medium text-brand-600 underline">
              {t.contactUs}
            </a>
            .
          </p>
        )}
      </div>
    </Container>
  );
}
