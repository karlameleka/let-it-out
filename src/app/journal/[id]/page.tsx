import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getJournalLockEnabled } from "@/lib/journal-lock";
import JournalLockGate from "@/components/journal-lock-gate";
import EntryDetailClient from "./entry-detail-client";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [{ id }, lockEnabled, locale] = await Promise.all([
    params,
    getJournalLockEnabled(user.userId),
    getLocale(),
  ]);
  const dict = getDictionary(locale);

  return (
    <JournalLockGate enabled={lockEnabled} dict={dict.journalLock}>
      <EntryDetailClient userId={user.userId} id={id} dict={dict.entryDetail} locale={locale} />
    </JournalLockGate>
  );
}
