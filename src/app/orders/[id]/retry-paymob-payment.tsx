"use client";

import PaymentSelector from "@/components/PaymentSelector";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function RetryPaymobPayment({
  orderId,
  accessToken,
  amountEGP,
  dict,
}: {
  orderId: string;
  accessToken?: string;
  amountEGP: number;
  dict: Dictionary["paymentSelector"];
}) {
  return (
    <PaymentSelector
      amountEGP={amountEGP}
      getOrderId={async () => ({ id: orderId, accessToken: accessToken ?? "" })}
      dict={dict}
    />
  );
}
