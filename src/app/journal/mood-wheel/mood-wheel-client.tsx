"use client";

import Link from "next/link";
import { Container } from "@/components/ui";
import EmotionsWheel from "@/components/emotions-wheel";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

export default function MoodWheelClient({
  userId,
  locale,
  dict,
}: {
  userId: string;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <Container className="max-w-2xl py-16 sm:py-20">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-3xl font-medium text-brand-900">{dict.moodWheel.title}</h1>
        <Link href="/journal/patterns" className="text-sm font-medium text-brand-600 link-grow">
          {dict.moodWheel.viewPatterns}
        </Link>
      </div>
      <p className="mt-2 text-base text-ink/60">{dict.moodWheel.subtitle}</p>

      <div className="mt-10 flex justify-center">
        <EmotionsWheel userId={userId} locale={locale} dict={dict.profile} />
      </div>
    </Container>
  );
}
