import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getNextPrompt } from "@/lib/prompts";
import { getJournalLockEnabled } from "@/lib/journal-lock";
import { Container, Eyebrow } from "@/components/ui";
import { Swash } from "@/components/decor";
import JournalLockGate from "@/components/journal-lock-gate";
import NewEntryClient from "./new-entry-client";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = { title: "New Entry" };

export default async function NewJournalEntryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [prompt, lockEnabled, locale] = await Promise.all([
    getNextPrompt(user.userId),
    getJournalLockEnabled(user.userId),
    getLocale(),
  ]);
  const dict = getDictionary(locale);
  const t = dict.entryForm;

  return (
    <JournalLockGate enabled={lockEnabled} dict={dict.journalLock}>
      <Container className="max-w-2xl py-16 sm:py-20">
        <Link href="/journal" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow">
          &larr; {t.backToJournal}
        </Link>
        <div className="mt-4">
          <Eyebrow>{t.newEntryEyebrow}</Eyebrow>
        </div>
        <h1 className="mt-3 font-display text-3xl font-medium text-brand-900">
          {t.titlePrefix}{" "}
          <span className="mark-swash italic text-brand-700">
            {t.titleHighlight}
            <Swash />
          </span>
          {t.titleSuffix}
        </h1>
        <div className="mt-8">
          <NewEntryClient userId={user.userId} initialPrompt={prompt} dict={t} moodPickerDict={dict.moodPicker} locale={locale} />
        </div>
      </Container>
    </JournalLockGate>
  );
}
