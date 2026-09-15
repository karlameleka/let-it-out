import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getJournalLockEnabled } from "@/lib/journal-lock";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getAssessment, type AssessmentSlug } from "@/lib/assessments";
import { Container, Eyebrow } from "@/components/ui";
import JournalLockGate from "@/components/journal-lock-gate";
import AssessmentQuiz from "@/components/assessment-quiz";
import OpenInAppBanner from "@/components/open-in-app-banner";

/**
 * Shared body for every /qr/<token> assessment page (see qr-tokens.ts for
 * the token → assessment mapping) — these exist only to be reached by
 * scanning a QR code printed in a physical guided journal (see
 * assessments.ts), so they're deliberately not linked anywhere else on the
 * site (no nav, no sitemap, robots.txt disallows /qr, and this folder's
 * `_shared` prefix keeps this file itself out of the route tree).
 * Login-gated because results save to the visitor's own journal — there's
 * no anonymous/guest path here, unlike most of the site's public forms.
 */
export default async function AssessmentPageContent({ slug }: { slug: AssessmentSlug }) {
  const definition = getAssessment(slug);
  if (!definition) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const lockEnabled = await getJournalLockEnabled(user.userId);

  return (
    <JournalLockGate enabled={lockEnabled} dict={dict.journalLock}>
      <Container className="max-w-2xl py-16 sm:py-20">
        <OpenInAppBanner />
        <Eyebrow>{definition.eyebrow}</Eyebrow>
        <h1 className="mt-3 font-display text-3xl font-medium text-brand-900">{definition.title}</h1>
        <p className="mt-3 text-sm text-ink/70">{definition.intro}</p>
        <p className="mt-3 text-xs text-ink/40">{definition.sourceNote}</p>
        <div className="mt-8">
          <AssessmentQuiz definition={definition} userId={user.userId} />
        </div>
      </Container>
    </JournalLockGate>
  );
}
