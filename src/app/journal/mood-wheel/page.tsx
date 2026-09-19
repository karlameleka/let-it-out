import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getJournalLockEnabled } from "@/lib/journal-lock";
import JournalLockGate from "@/components/journal-lock-gate";
import MoodWheelClient from "./mood-wheel-client";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = { title: "Log a Mood" };

export default async function MoodWheelPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [lockEnabled, locale] = await Promise.all([getJournalLockEnabled(user.userId), getLocale()]);
  const dict = getDictionary(locale);

  return (
    <JournalLockGate enabled={lockEnabled} dict={dict.journalLock}>
      <MoodWheelClient userId={user.userId} locale={locale} dict={dict} />
    </JournalLockGate>
  );
}
