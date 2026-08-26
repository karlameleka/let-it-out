"use client";

import PaymentSelector from "@/components/PaymentSelector";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function RetryPaymobPayment({
  orderId,
  amountEGP,
  dict,
}: {
  orderId: string;
  amountEGP: number;
  dict: Dictionary["paymentSelector"];
}) {
  return <PaymentSelector amountEGP={amountEGP} getOrderId={async () => orderId} dict={dict} />;
}
