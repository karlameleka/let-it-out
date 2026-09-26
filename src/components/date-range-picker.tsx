"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { PRESETS, rangeForPreset, toDateParam, type PresetKey } from "@/lib/date-range";

/**
 * Global filter control for every dashboard page that scopes its data to a
 * date range — preset buttons (Today / Last 7 days / …) plus a custom
 * from/to pair, all driven through the URL's ?from=&to= search params
 * (see lib/date-range.ts) rather than local component state. That's what
 * makes a filtered dashboard view shareable/bookmarkable and keeps the
 * server component doing the actual data fetching, instead of re-fetching
 * client-side on every change.
 */
export default function DateRangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentFrom = searchParams.get("from");
  const currentTo = searchParams.get("to");
  const activePreset = detectActivePreset(currentFrom, currentTo);
  const [showCustom, setShowCustom] = useState(activePreset === null && Boolean(currentFrom || currentTo));

  function applyRange(from: string, to: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", from);
    params.set("to", to);
    // A date-range change re-scopes the whole page's data — any page
    // number from before no longer points at the same rows.
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyPreset(key: PresetKey) {
    setShowCustom(false);
    const { from, to } = rangeForPreset(key);
    applyRange(toDateParam(from), toDateParam(to));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Calendar className="h-4 w-4 shrink-0 text-ink/40" strokeWidth={2} />
      {PRESETS.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => applyPreset(p.key)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            !showCustom && activePreset === p.key
              ? "bg-brand-700 text-white"
              : "border border-brand-200 text-ink/70 hover:bg-brand-50"
          }`}
        >
          {p.label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => setShowCustom((v) => !v)}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
          showCustom ? "bg-brand-700 text-white" : "border border-brand-200 text-ink/70 hover:bg-brand-50"
        }`}
      >
        Custom
      </button>
      {showCustom && (
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const from = String(form.get("from") ?? "");
            const to = String(form.get("to") ?? "");
            if (from && to) applyRange(from, to);
          }}
        >
          <input
            type="date"
            name="from"
            defaultValue={currentFrom ?? ""}
            max={currentTo ?? undefined}
            className="rounded-lg border border-brand-200 px-2 py-1.5 text-xs outline-none focus:border-brand-500"
          />
          <span className="text-xs text-ink/40">to</span>
          <input
            type="date"
            name="to"
            defaultValue={currentTo ?? ""}
            min={currentFrom ?? undefined}
            className="rounded-lg border border-brand-200 px-2 py-1.5 text-xs outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
          >
            Apply
          </button>
        </form>
      )}
    </div>
  );
}

/** Whether the current from/to exactly matches one of the presets, so the
 * right button can render as active — null (nothing highlighted) for a
 * genuinely custom range, or when nothing's been picked yet (the page's
 * own last-30-days default applies without a URL param to match against). */
function detectActivePreset(from: string | null, to: string | null): PresetKey | null {
  if (!from && !to) return "30d";
  if (!from || !to) return null;
  for (const p of PRESETS) {
    const range = rangeForPreset(p.key);
    if (toDateParam(range.from) === from && toDateParam(range.to) === to) return p.key;
  }
  return null;
}
