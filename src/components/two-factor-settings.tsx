"use client";

import { useActionState, useState } from "react";
import {
  beginTotpEnrollment,
  confirmTotpEnrollment,
  disableTotpAction,
  type BeginEnrollmentResult,
} from "@/lib/totp-actions";

function ConfirmStep({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(confirmTotpEnrollment, undefined);

  if (state?.success) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
        Two-factor authentication is now on.
        <button type="button" onClick={onDone} className="ml-2 font-semibold underline">
          Done
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="totp-confirm-code" className="mb-1 block text-xs font-medium text-ink/60">
          Enter the 6-digit code from your app
        </label>
        <input
          id="totp-confirm-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          className="w-32 rounded-lg border border-brand-200 px-3 py-2 text-sm tracking-widest outline-none focus:border-brand-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
      >
        {pending ? "Checking…" : "Confirm & enable"}
      </button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

function EnrollmentFlow() {
  const [enrollment, setEnrollment] = useState<BeginEnrollmentResult | null>(null);
  const [starting, setStarting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function start() {
    setStarting(true);
    const result = await beginTotpEnrollment();
    setEnrollment(result);
    setStarting(false);
  }

  if (confirmed) {
    return (
      <p className="text-sm text-brand-800">
        Two-factor authentication is on. Reload this page to see it reflected below.
      </p>
    );
  }

  if (!enrollment) {
    return (
      <button
        type="button"
        onClick={start}
        disabled={starting}
        className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
      >
        {starting ? "Generating…" : "Set up two-factor authentication"}
      </button>
    );
  }

  if ("error" in enrollment) {
    return <p className="text-sm text-red-600">{enrollment.error}</p>;
  }

  return (
    <div className="space-y-5 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
      <div>
        <p className="text-sm font-semibold text-brand-900">1. Scan this with your authenticator app</p>
        <p className="mt-0.5 text-xs text-ink/60">
          Google Authenticator, 1Password, Authy — any TOTP app works.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element -- locally generated data: URI, not a remote image */}
        <img
          src={enrollment.qrDataUrl}
          alt="Scan this QR code with your authenticator app"
          className="mt-3 h-40 w-40 rounded-lg border border-brand-100 bg-white p-2"
        />
        <p className="mt-2 text-xs text-ink/50">
          Can&apos;t scan?{" "}
          <span className="font-mono tracking-wider text-ink/70">{enrollment.manualEntrySecret}</span>
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-brand-900">2. Save these backup codes</p>
        <p className="mt-0.5 text-xs text-ink/60">
          Each works once, if you ever lose access to your authenticator app. Store them somewhere safe — they
          won&apos;t be shown again.
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1.5 rounded-lg border border-brand-100 bg-white p-3 font-mono text-xs text-ink/80 sm:grid-cols-4">
          {enrollment.backupCodes.map((code) => (
            <span key={code}>{code}</span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-brand-900">3. Confirm it works</p>
        <ConfirmStep onDone={() => setConfirmed(true)} />
      </div>
    </div>
  );
}

function DisableFlow() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(disableTotpAction, undefined);

  if (state?.success) {
    return <p className="text-sm text-ink/60">Two-factor authentication turned off. Reload to confirm.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        Turn off two-factor authentication
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="totp-disable-password" className="mb-1 block text-xs font-medium text-ink/60">
          Confirm your password
        </label>
        <input
          id="totp-disable-password"
          name="password"
          type="password"
          className="w-48 rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
      >
        {pending ? "Turning off…" : "Turn off"}
      </button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

export default function TwoFactorSettings({ enabled }: { enabled: boolean }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5">
      <p className="text-sm font-semibold text-brand-900">
        Two-factor authentication{" "}
        <span className={enabled ? "text-brand-600" : "text-ink/40"}>{enabled ? "· On" : "· Off"}</span>
      </p>
      <p className="mt-0.5 text-xs text-ink/60">
        Requires a code from an authenticator app in addition to your password when logging in to this admin
        account.
      </p>
      <div className="mt-4">{enabled ? <DisableFlow /> : <EnrollmentFlow />}</div>
    </div>
  );
}
