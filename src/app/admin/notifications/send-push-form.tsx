"use client";

import { useActionState } from "react";
import { sendManualPushNotification, type SendPushFormState } from "@/lib/admin-actions";

const inputClass = "w-full rounded-lg border border-brand-200 px-3 py-2 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-1 block text-xs font-medium text-ink/60";

export default function SendPushForm() {
  const [state, formAction, pending] = useActionState<SendPushFormState, FormData>(sendManualPushNotification, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className={labelClass} htmlFor="push-title">Headline (English)</label>
        <input id="push-title" name="title" required placeholder="e.g. New workshop this Thursday" className={inputClass} />
        <p className="mt-1 text-[11px] text-ink/40">
          Shown as the notification&rsquo;s title — the app name is already shown separately by the browser/OS.
        </p>
      </div>
      <div>
        <label className={labelClass} htmlFor="push-body">Message (English)</label>
        <textarea id="push-body" name="body" required rows={2} placeholder="A short line clients will see on their lock screen" className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="push-title-ar">Headline (Arabic, optional)</label>
        <input id="push-title-ar" name="titleAr" dir="rtl" placeholder="مثال: ورشة جديدة يوم الخميس" className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="push-body-ar">Message (Arabic, optional)</label>
        <textarea id="push-body-ar" name="bodyAr" dir="rtl" rows={2} placeholder="سطر قصير هيشوفه العملاء اللي عندهم اللغة العربية" className={inputClass} />
        <p className="mt-1 text-[11px] text-ink/40">
          Sent to clients whose site language is Arabic; falls back to the English headline/message above if left blank.
        </p>
      </div>
      <div>
        <label className={labelClass} htmlFor="push-url">Link (optional)</label>
        <input id="push-url" name="url" placeholder="/upcoming" className={inputClass} />
        <p className="mt-1 text-[11px] text-ink/40">Where tapping the notification takes them. Defaults to /upcoming.</p>
      </div>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-xs text-brand-600">
          Sent to {state.sent} of {state.total} subscribed {state.total === 1 ? "browser" : "browsers"}.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send now"}
      </button>
    </form>
  );
}
