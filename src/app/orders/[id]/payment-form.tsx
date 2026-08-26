"use client";

import { useActionState } from "react";
import { submitPaymentReference } from "@/lib/order-actions";
import { Button } from "@/components/ui";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function PaymentForm({ orderId, dict }: { orderId: string; dict: Dictionary["orderStatus"] }) {
  const [state, formAction, pending] = useActionState(submitPaymentReference, undefined);

  if (state?.success) {
    return (
      <div className="rounded-xl bg-brand-50 p-5 text-center">
        <p className="font-display font-semibold text-brand-800">{dict.referenceReceivedTitle}</p>
        <p className="mt-2 text-sm text-ink/70">{dict.referenceReceivedText}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />
      <div>
        <label htmlFor="paymentRef" className="mb-1 block text-sm font-medium text-ink/80">
          {dict.paymentRefLabel}
        </label>
        <input
          id="paymentRef"
          name="paymentRef"
          required
          placeholder={dict.paymentRefPlaceholder}
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <div>
        <label htmlFor="paymentNote" className="mb-1 block text-sm font-medium text-ink/80">
          {dict.noteLabel}
        </label>
        <textarea
          id="paymentNote"
          name="paymentNote"
          rows={2}
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? dict.submitting : dict.submitReference}
      </Button>
    </form>
  );
}
