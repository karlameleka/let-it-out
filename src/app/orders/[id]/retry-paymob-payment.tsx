"use client";

import PaymentSelector from "@/components/PaymentSelector";

export default function RetryPaymobPayment({ orderId, amountEGP }: { orderId: string; amountEGP: number }) {
  return <PaymentSelector amountEGP={amountEGP} getOrderId={async () => orderId} />;
}
