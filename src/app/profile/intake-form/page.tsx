import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { hasConfirmedSession, getFirstConfirmedSessionCounselor } from "@/lib/upcoming-items";
import { getMyIntakeSubmission } from "@/lib/intake-actions";
import { getIntakeSections } from "@/lib/intake-form-config";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { Container } from "@/components/ui";
import AccountIntakeForm from "./account-intake-form";

export const metadata: Metadata = { title: "My Intake Form" };

export default async function MyIntakeFormPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const t = dict.myIntakeForm;

  const [confirmed, counselor, account] = await Promise.all([
    hasConfirmedSession(user.email),
    getFirstConfirmedSessionCounselor(user.email),
    prisma.user.findUnique({ where: { id: user.userId }, select: { createdAt: true } }),
  ]);
  if (!confirmed || !counselor || !account) redirect("/profile");

  const submission = await getMyIntakeSubmission(user.email, account.createdAt);

  const backLink = (
    <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow">
      <span className="inline-block rtl:-scale-x-100">&larr;</span> {t.backToProfile}
    </Link>
  );

  if (submission) {
    const dateFormatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const answersBySection = new Map<string, { label: string; value: string }[]>();
    for (const a of submission.answers) {
      const list = answersBySection.get(a.section) ?? [];
      list.push({ label: a.label, value: a.value });
      answersBySection.set(a.section, list);
    }

    return (
      <Container className="max-w-2xl py-10 sm:py-14">
        {backLink}
        <h1 className="mt-4 font-display text-2xl font-semibold text-brand-900 sm:text-3xl">{t.title}</h1>

        <div className="mt-6 flex gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
          <ShieldCheck className="h-5 w-5 shrink-0 text-brand-600" strokeWidth={2} />
          <div className="text-sm text-ink/70">
            <p>
              <strong className="text-ink/90">{t.submittedTitle}</strong>{" "}
              {t.submittedBody.replace("{counselor}", submission.counselorName).replace("{date}", dateFormatter.format(new Date(submission.submittedAt)))}
            </p>
            <p className="mt-1.5 text-xs text-ink/50">{t.lockedNotice}</p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <h2 className="font-display text-lg font-semibold text-brand-900">{t.yourAnswers}</h2>
          {Array.from(answersBySection.entries()).map(([section, rows]) => (
            <div key={section} className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
              <h3 className="font-display font-semibold text-brand-900">{section}</h3>
              <div className="mt-3 space-y-3">
                {rows.map((row) => (
                  <div key={row.label}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">{row.label}</p>
                    <p className="mt-0.5 text-sm text-ink/80 whitespace-pre-wrap">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  const sections = await getIntakeSections(locale);

  return (
    <>
      <div className="pt-6 sm:pt-10">
        <Container className="max-w-2xl">{backLink}</Container>
      </div>
      <AccountIntakeForm clientName={user.name} counselorName={counselor.counselorName} sections={sections} dict={t} fieldDict={dict.intake} />
    </>
  );
}
