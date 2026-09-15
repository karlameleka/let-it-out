import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getJournalLockEnabled } from "@/lib/journal-lock";
import { getReflectionQuestions } from "@/lib/reflection-sheet-config";
import { Container, Eyebrow } from "@/components/ui";
import JournalLockGate from "@/components/journal-lock-gate";
import ReflectionClient from "./reflection-client";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = { title: "Reflection Sheet" };

export default async function ReflectionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const locale = await getLocale();
  const [lockEnabled, questions] = await Promise.all([
    getJournalLockEnabled(user.userId),
    getReflectionQuestions(locale),
  ]);
  const dict = getDictionary(locale);
  const t = dict.reflectionSheet;

  return (
    <JournalLockGate enabled={lockEnabled} dict={dict.journalLock}>
      <Container className="max-w-2xl py-16 sm:py-20">
        <Link href="/journal" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow">
          <span className="inline-block rtl:-scale-x-100">&larr;</span> {dict.entryForm.backToJournal}
        </Link>
        <div className="mt-4">
          <Eyebrow>{t.eyebrow}</Eyebrow>
        </div>
        <h1 className="mt-3 font-display text-3xl font-medium text-brand-900">{t.title}</h1>
        <p className="mt-3 text-sm text-ink/60">{t.description}</p>
        <div className="mt-8">
          <ReflectionClient userId={user.userId} questions={questions} dict={t} />
        </div>
      </Container>
    </JournalLockGate>
  );
}
