import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui";
import { getCurrentUser } from "@/lib/session";
import { getJournalLockEnabled } from "@/lib/journal-lock";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import JournalLockGate from "@/components/journal-lock-gate";
import MyAssessmentsList from "./my-assessments-list";

export const metadata: Metadata = {
  title: "My Assessments",
  robots: { index: false, follow: false },
};

/** Destination for the unlocked "My Assessments" promo card on /resources —
 * login-gated since results are tied to the visitor's own account/journal,
 * same as the QR assessment pages themselves. */
export default async function MyAssessmentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const locale = await getLocale();
  const t = getDictionary(locale).myAssessments;
  const lockEnabled = await getJournalLockEnabled(user.userId);

  return (
    <JournalLockGate enabled={lockEnabled} dict={getDictionary(locale).journalLock}>
      <Container className="max-w-2xl py-16 sm:py-20">
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={2} /> {t.backToResources}
        </Link>
        <div className="mt-6">
          <Eyebrow>{t.ribbon}</Eyebrow>
        </div>
        <h1 className="mt-3 font-display text-3xl font-medium text-brand-900">{t.title}</h1>
        <p className="mt-3 text-sm text-ink/70">{t.description}</p>
        <div className="mt-8">
          <MyAssessmentsList userId={user.userId} dict={t} />
        </div>
      </Container>
    </JournalLockGate>
  );
}
