"use client";

import PaymentSelector from "@/components/PaymentSelector";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function RetrySessionPayment({
  sessionBookingId,
  amountEGP,
  dict,
}: {
  sessionBookingId: string;
  amountEGP: number;
  dict: Dictionary["paymentSelector"];
}) {
  return (
    <PaymentSelector
      amountEGP={amountEGP}
      getOrderId={async () => sessionBookingId}
      endpoint="/api/checkout/paymob-session"
      idField="sessionBookingId"
      dict={dict}
    />
  );
}
