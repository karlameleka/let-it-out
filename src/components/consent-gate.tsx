"use client";

export default function ConsentGate({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/50 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg animate-pop-in overflow-hidden rounded-3xl border-2 border-brand-100 bg-white shadow-2xl">
        <div className="bg-brand-700 px-6 py-5 text-white">
          <h2 className="font-display text-lg font-semibold">
            Your privacy, protected
          </h2>
          <p className="mt-1 text-sm text-brand-100/80">
            Before you continue, here&apos;s how we look after your
            information.
          </p>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          <p className="text-sm leading-relaxed text-ink/75">
            Whatever you share with us — in a counseling session, a journal
            entry, or a form on this site — is treated as confidential. We
            do not sell your data, and we do not use tracking cookies. The
            only things we save to your device (in local browser storage,
            never a tracking cookie) are simple preferences like your cart
            or your chosen country.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-ink/70">
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] text-brand-700">✓</span>
              Your data is encrypted in transit and access is restricted to
              authorized staff.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] text-brand-700">✓</span>
              Journal entries and session details are kept confidential.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] text-brand-700">✓</span>
              No cookies, no ad trackers, no selling your information.
            </li>
          </ul>
          <p className="mt-4 text-sm text-ink/60">
            By continuing, you agree to our{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 underline">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 underline">
              Terms &amp; Conditions
            </a>
            , and consent to us processing your information as described
            there, so we can provide our services to you.
          </p>
        </div>
        <div className="border-t border-brand-100 px-6 py-4">
          <button
            type="button"
            onClick={onAccept}
            className="w-full rounded bg-brand-500 px-5 py-3 text-sm font-semibold tracking-tight text-white shadow-sm shadow-brand-800/20 transition-all duration-300 ease-out hover:bg-brand-400 active:bg-brand-400 hover:shadow-[0_0_0_6px_rgba(51,136,164,0.18)] active:shadow-[0_0_0_6px_rgba(51,136,164,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
          >
            I understand and agree
          </button>
        </div>
      </div>
    </div>
  );
}
