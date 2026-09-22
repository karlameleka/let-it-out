import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getMyThoughtRecordAssignment } from "@/lib/client-resources";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { Container } from "@/components/ui";
import { Ribbon, DoodleField } from "@/components/decor";
import ThoughtRecordPageClient from "./thought-record-page-client";

export const metadata: Metadata = { title: "Thought Record" };

export default async function ProfileThoughtRecordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const locale = await getLocale();
  const t = getDictionary(locale).thoughtRecord;

  const assignment = await getMyThoughtRecordAssignment(user.email);
  if (!assignment) redirect("/profile");

  return (
    <>
      <section className="relative overflow-hidden bg-brand-50 pt-6 pb-10 sm:pt-14 sm:pb-20">
        <DoodleField />
        <Container className="relative max-w-2xl">
          <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow">
            <span className="inline-block rtl:-scale-x-100">&larr;</span> {t.backToProfile}
          </Link>
          <div className="mt-4">
            <Ribbon>{t.ribbon}</Ribbon>
          </div>
          <h1 className="mt-4 font-display text-3xl font-medium leading-[1.1] text-brand-900 sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-4 text-lg text-ink/70">{t.description}</p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="max-w-2xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-brand-100 bg-white p-5">
              <h2 className="font-display font-semibold text-brand-900">{t.whatIsAThoughtRecordTitle}</h2>
              <p className="mt-2 text-sm text-ink/70">{t.whatIsAThoughtRecordBody}</p>
            </div>
            <div className="rounded-2xl border border-brand-100 bg-white p-5">
              <h2 className="font-display font-semibold text-brand-900">{t.whyItHelpsTitle}</h2>
              <p className="mt-2 text-sm text-ink/70">{t.whyItHelpsBody}</p>
            </div>
          </div>

          <div className="mt-8">
            <ThoughtRecordPageClient itemId={assignment.id} isDone={Boolean(assignment.completedAt)} dict={t} locale={locale} />
          </div>
        </Container>
      </section>
    </>
  );
}
