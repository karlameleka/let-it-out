"use client";

import PaymentSelector from "@/components/PaymentSelector";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function RetrySessionPayment({
  sessionBookingId,
  accessToken,
  amountEGP,
  dict,
}: {
  sessionBookingId: string;
  accessToken?: string;
  amountEGP: number;
  dict: Dictionary["paymentSelector"];
}) {
  return (
    <PaymentSelector
      amountEGP={amountEGP}
      getOrderId={async () => ({ id: sessionBookingId, accessToken: accessToken ?? "" })}
      endpoint="/api/checkout/paymob-session"
      idField="sessionBookingId"
      dict={dict}
    />
  );
}
