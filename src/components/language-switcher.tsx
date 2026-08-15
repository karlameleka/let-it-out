"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/dictionary";

export default function LanguageSwitcher({
  locale,
  dict,
  compact = false,
  arabicEnabled = true,
}: {
  locale: Locale;
  dict: Dictionary["languageSwitcher"];
  compact?: boolean;
  arabicEnabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  if (!arabicEnabled) return null;

  return (
    <div
      role="group"
      aria-label={dict.label}
      className={`inline-flex items-center rounded-full border border-brand-200 bg-white p-0.5 ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      <button
        type="button"
        onClick={() => switchTo("en")}
        disabled={pending}
        aria-pressed={locale === "en"}
        className={`rounded-full px-3 py-1 font-medium transition-colors disabled:opacity-60 ${
          locale === "en" ? "bg-brand-600 text-white" : "text-ink/60 hover:text-brand-700"
        }`}
      >
        {dict.english}
      </button>
      <button
        type="button"
        onClick={() => switchTo("ar")}
        disabled={pending}
        aria-pressed={locale === "ar"}
        className={`rounded-full px-3 py-1 font-medium transition-colors disabled:opacity-60 ${
          locale === "ar" ? "bg-brand-600 text-white" : "text-ink/60 hover:text-brand-700"
        }`}
      >
        {dict.arabic}
      </button>
    </div>
  );
}
