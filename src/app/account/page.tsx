import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { Container, Eyebrow } from "@/components/ui";
import ChangePasswordForm from "./change-password-form";
import ProfileForm from "./profile-form";
import JournalLockToggle from "./journal-lock-toggle";
import JournalReminderToggle from "@/components/journal-reminder-toggle";
import ExportDataButton from "./export-data-button";
import DeleteAccountForm from "./delete-account-form";
import LanguageSwitcher from "@/components/language-switcher";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Account Settings" };

export default async function AccountPage() {
  const [session, locale, settings] = await Promise.all([getCurrentUser(), getLocale(), getSiteSettings()]);
  if (!session) redirect("/login");
  const dict = getDictionary(locale);
  const t = dict.account;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      ageRange: true,
      gender: true,
      country: true,
      referralSource: true,
      journalLockEnabled: true,
    },
  });

  return (
    <Container className="max-w-xl pt-10 pb-16 sm:pt-14 sm:pb-20">
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-medium text-brand-900">{t.title}</h1>
      <p className="mt-2 text-sm text-ink/60">{t.signedInAs} {session.email}</p>

      {settings.arabicEnabled && (
        <div className="mt-8 rounded-2xl border-2 border-brand-100 bg-white p-6 sm:p-8">
          <h2 className="font-display font-semibold text-brand-900">{t.languageTitle}</h2>
          <p className="mt-1 text-sm text-ink/60">{t.languageDescription}</p>
          <div className="mt-4">
            <LanguageSwitcher locale={locale} dict={dict.languageSwitcher} arabicEnabled={settings.arabicEnabled} />
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border-2 border-brand-100 bg-white p-6 sm:p-8">
        <h2 className="font-display font-semibold text-brand-900">{t.aboutYouTitle}</h2>
        <p className="mt-1 text-sm text-ink/60">{t.aboutYouDescription}</p>
        <ProfileForm
          dict={dict}
          ageRange={user?.ageRange ?? null}
          gender={user?.gender ?? null}
          country={user?.country ?? null}
          referralSource={user?.referralSource ?? null}
        />
      </div>

      <div className="mt-8 rounded-2xl border-2 border-brand-100 bg-white p-6 sm:p-8">
        <h2 className="font-display font-semibold text-brand-900">{t.journalPrivacyTitle}</h2>
        <p className="mt-1 text-sm text-ink/60">{t.journalPrivacyDescription}</p>
        <JournalLockToggle initialEnabled={user?.journalLockEnabled ?? false} dict={dict} />
      </div>

      <div className="mt-8 rounded-2xl border-2 border-brand-100 bg-white p-6 sm:p-8">
        <h2 className="font-display font-semibold text-brand-900">{t.notificationsTitle}</h2>
        <p className="mt-1 text-sm text-ink/60">{t.notificationsDescription}</p>
        <div className="mt-4">
          <JournalReminderToggle />
        </div>
      </div>

      <div className="mt-8 rounded-2xl border-2 border-brand-100 bg-white p-6 sm:p-8">
        <h2 className="font-display font-semibold text-brand-900">{t.changePasswordTitle}</h2>
        <p className="mt-1 text-sm text-ink/60">{t.changePasswordDescription}</p>
        <ChangePasswordForm dict={dict} />
      </div>

      <div className="mt-8 rounded-2xl border-2 border-brand-100 bg-white p-6 sm:p-8">
        <h2 className="font-display font-semibold text-brand-900">{t.yourDataTitle}</h2>
        <p className="mt-1 text-sm text-ink/60">{t.yourDataDescription}</p>
        <ExportDataButton dict={dict} />
      </div>

      <div className="mt-8 rounded-2xl border-2 border-red-100 bg-white p-6 sm:p-8">
        <h2 className="font-display font-semibold text-red-700">{t.dangerZoneTitle}</h2>
        <p className="mt-1 text-sm text-ink/60">{t.dangerZoneDescription}</p>
        <DeleteAccountForm dict={dict} />
      </div>
    </Container>
  );
}
