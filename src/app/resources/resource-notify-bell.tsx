"use client";

import { useActionState, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { submitResourceNotify } from "@/lib/resource-notify-actions";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function ResourceNotifyBell({ dict }: { dict: Dictionary["resourceNotifyBell"] }) {
  const [expanded, setExpanded] = useState(false);
  const [state, formAction, pending] = useActionState(submitResourceNotify, undefined);

  if (state?.success) {
    return (
      <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-brand-700">
        <BellRing className="h-4 w-4" strokeWidth={2} />
        {dict.confirmed}
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-4 py-2 text-sm font-medium text-brand-600 transition-colors hover:border-brand-400 active:border-brand-400 hover:bg-brand-50 active:bg-brand-50"
        >
          <Bell className="h-4 w-4" strokeWidth={2} />
          {dict.notifyMe}
        </button>
      ) : (
        <form action={formAction} className="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
          <input
            type="email"
            name="email"
            required
            placeholder="you@email.com"
            className="w-full flex-1 rounded-full border border-brand-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-500 active:bg-brand-500 hover:shadow-[0_0_0_6px_rgba(51,136,164,0.18)] active:shadow-[0_0_0_6px_rgba(51,136,164,0.18)] disabled:opacity-60"
          >
            {pending ? "…" : dict.submit}
          </button>
        </form>
      )}
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </div>
  );
}
