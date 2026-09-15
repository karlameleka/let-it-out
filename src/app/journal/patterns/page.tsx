import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getJournalLockEnabled } from "@/lib/journal-lock";
import JournalLockGate from "@/components/journal-lock-gate";
import PatternsClient from "./patterns-client";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = { title: "Mood Patterns" };

export default async function MoodPatternsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [lockEnabled, locale] = await Promise.all([getJournalLockEnabled(user.userId), getLocale()]);
  const dict = getDictionary(locale);

  return (
    <JournalLockGate enabled={lockEnabled} dict={dict.journalLock}>
      <PatternsClient userId={user.userId} dict={dict.moodPatterns} locale={locale} />
    </JournalLockGate>
  );
}
