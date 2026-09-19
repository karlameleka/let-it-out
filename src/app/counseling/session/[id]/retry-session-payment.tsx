"use client";

import PaymentSelector from "@/components/PaymentSelector";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

export default function RetrySessionPayment({
  sessionBookingId,
  accessToken,
  amountEGP,
  dict,
  counselorProfileDict,
  locale,
}: {
  sessionBookingId: string;
  accessToken?: string;
  amountEGP: number;
  dict: Dictionary["paymentSelector"];
  counselorProfileDict: Dictionary["counselorProfile"];
  locale: Locale;
}) {
  return (
    <div>
      <PaymentSelector
        amountEGP={amountEGP}
        getOrderId={async () => ({ id: sessionBookingId, accessToken: accessToken ?? "" })}
        endpoint="/api/checkout/paymob-session"
        idField="sessionBookingId"
        dict={dict}
      />
      {/* Temporary manual-payment fallback — counseling checkout only,
          remove once no longer needed. */}
      <div className="mt-4 flex items-center gap-3 text-xs text-ink/35">
        <span className="h-px flex-1 bg-brand-100" />
        <span>{locale === "ar" ? "أو" : "or"}</span>
        <span className="h-px flex-1 bg-brand-100" />
      </div>
      <a
        href="https://ipn.eg/S/letitout/instapay/26Ormc"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block w-full rounded border-2 border-brand-200 px-5 py-3 text-center text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
      >
        {counselorProfileDict.payWithInstapay}
      </a>
      <p className="mt-2 text-xs text-ink/45">{counselorProfileDict.instapayNote}</p>
    </div>
  );
}
