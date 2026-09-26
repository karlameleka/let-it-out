import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getMyOrders } from "@/lib/my-orders";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { formatEGP } from "@/lib/format";
import { Container, ButtonLink } from "@/components/ui";

export const metadata: Metadata = { title: "My Orders" };

export default async function MyOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.myOrders;

  const orders = await getMyOrders(user.userId);

  const STATUS_LABEL: Record<string, string> = {
    PENDING_PAYMENT: dict.orderStatus.statusPendingPayment,
    PAYMENT_SUBMITTED: dict.orderStatus.statusPaymentSubmitted,
    CONFIRMED: dict.orderStatus.statusConfirmed,
    SHIPPED: dict.orderStatus.statusShipped,
    COMPLETED: dict.orderStatus.statusCompleted,
    CANCELLED: dict.orderStatus.statusCancelled,
  };

  const dateFormatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Container className="max-w-2xl py-16 sm:py-20">
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow">
        <span className="inline-block rtl:-scale-x-100">&larr;</span> {t.backToProfile}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-medium text-brand-900">{t.title}</h1>
      <p className="mt-2 text-sm text-ink/60">{t.subtitle}</p>

      {orders.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-sm text-ink/60">{t.noOrdersYet}</p>
          <ButtonLink href="/shop" variant="outline" className="mt-4">
            {t.browseShop}
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-2xl border-2 border-brand-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-900">
                    {dict.orderStatus.orderNumber.replace("{id}", order.id.slice(-8).toUpperCase())}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/40">{dateFormatter.format(order.createdAt)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-ink/70">
                {order.items.length === 1
                  ? t.itemsCount.replace("{n}", "1")
                  : t.itemsCountPlural.replace("{n}", String(order.items.length))}
                {" · "}
                <span className="font-medium text-ink/90">{formatEGP(order.totalEGP)}</span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
