"use client";

import { useActionState } from "react";
import { submitPaymentReference } from "@/lib/order-actions";
import { Button } from "@/components/ui";

export default function PaymentForm({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState(submitPaymentReference, undefined);

  if (state?.success) {
    return (
      <div className="rounded-xl bg-brand-50 p-5 text-center">
        <p className="font-display font-semibold text-brand-800">Payment reference received</p>
        <p className="mt-2 text-sm text-ink/70">
          We&apos;ll confirm your payment and update your order shortly.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />
      <div>
        <label htmlFor="paymentRef" className="mb-1 block text-sm font-medium text-ink/80">
          InstaPay transaction reference
        </label>
        <input
          id="paymentRef"
          name="paymentRef"
          required
          placeholder="e.g. last 4 digits or reference ID from your InstaPay receipt"
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <div>
        <label htmlFor="paymentNote" className="mb-1 block text-sm font-medium text-ink/80">
          Note (optional)
        </label>
        <textarea
          id="paymentNote"
          name="paymentNote"
          rows={2}
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
      {state?.error && <p className="text-sm text-accent-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Submitting…" : "I've paid — submit reference"}
      </Button>
    </form>
  );
}
