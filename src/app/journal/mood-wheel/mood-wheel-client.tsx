"use client";

import { BookOpen, MessageCircle } from "lucide-react";
import { Container, Eyebrow, ButtonLink } from "@/components/ui";
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>{dict.moodWheel.eyebrow}</Eyebrow>
          <h1 className="mt-3 font-display text-3xl font-medium text-brand-900 sm:text-4xl">{dict.moodWheel.title}</h1>
          <p className="mt-2 max-w-sm text-base text-ink/60">{dict.moodWheel.subtitle}</p>
        </div>
        <ButtonLink href="/journal/patterns" variant="outline" className="shrink-0">
          {dict.moodWheel.viewPatterns}
        </ButtonLink>
      </div>

      <div className="mt-8 rounded-3xl border-2 border-brand-100 bg-white px-6 py-10 sm:px-10 sm:py-14">
        <EmotionsWheel userId={userId} locale={locale} dict={dict.profile} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <ButtonLink href="/journal/new" variant="outline" className="gap-2">
          <BookOpen className="h-4 w-4 shrink-0" strokeWidth={2} />
          {dict.moodWheel.journalAboutIt}
        </ButtonLink>
        <ButtonLink href="/counseling" variant="outline" className="gap-2">
          <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
          {dict.moodWheel.talkAboutIt}
        </ButtonLink>
      </div>
    </Container>
  );
}
