"use client";

import PaymentSelector from "@/components/PaymentSelector";

export default function RetrySessionPayment({
  sessionBookingId,
  amountEGP,
}: {
  sessionBookingId: string;
  amountEGP: number;
}) {
  return (
    <PaymentSelector
      amountEGP={amountEGP}
      getOrderId={async () => sessionBookingId}
      endpoint="/api/checkout/paymob-session"
      idField="sessionBookingId"
    />
  );
}
