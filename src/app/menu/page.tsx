import type { Metadata } from "next";
import Link from "next/link";
import { UserCircle, HelpCircle, Info, HeartHandshake, Users, ShoppingBag, Newspaper, Settings, LogOut, LogIn, UserPlus, ChevronRight } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui";
import { getCurrentUser } from "@/lib/session";
import { logoutAction } from "@/lib/auth-actions";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getSiteSettings } from "@/lib/site-settings";
import { getSiteTextOverrides, applyOverrides } from "@/lib/site-text";
import { prisma } from "@/lib/db";
import LanguageSwitcher from "@/components/language-switcher";
import DeleteAccountForm from "@/app/account/delete-account-form";

export const metadata: Metadata = { title: "Menu" };

function MenuLink({
  href,
  label,
  icon: Icon,
  bordered = false,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  bordered?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-5 py-4 text-base font-medium text-ink/80 hover:bg-brand-50 active:bg-brand-50 ${
        bordered ? "border-t border-brand-100" : ""
      }`}
    >
      <Icon className="h-5 w-5 shrink-0 text-brand-600" strokeWidth={1.9} />
      <span className="flex-1">{label}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink/30" strokeWidth={2} />
    </Link>
  );
}

export default async function MenuPage() {
  const [user, locale, settings, textOverrides] = await Promise.all([
    getCurrentUser(),
    getLocale(),
    getSiteSettings(),
    getSiteTextOverrides(),
  ]);
  const baseDict = getDictionary(locale);
  const dict = { ...baseDict, nav: applyOverrides(baseDict.nav, "nav", textOverrides, locale) };
  const t = dict.nav;

  const hasPassword = user
    ? (await prisma.user.findUnique({ where: { id: user.userId }, select: { passwordHash: true } }))?.passwordHash != null
    : false;

  const NAV_LINKS = [
    ...(user ? [{ href: "/profile", label: t.myProfile, icon: UserCircle }] : []),
    { href: "/help-center", label: t.helpCenter, icon: HelpCircle },
    { href: "/about", label: t.about, icon: Info },
    { href: "/counseling", label: t.counseling, icon: HeartHandshake },
    { href: "/workshops", label: t.workshops, icon: Users },
    { href: "/shop", label: t.shop, icon: ShoppingBag },
    { href: "/resources", label: t.resources, icon: Newspaper },
  ];

  return (
    <Container className="max-w-xl pt-6 pb-10 sm:pt-14 sm:pb-20">
      <Eyebrow>{t.menu}</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-medium text-brand-900">{t.menu}</h1>

      <div className="mt-6 overflow-hidden rounded-2xl border-2 border-brand-100 bg-white">
        {NAV_LINKS.map(({ href, label, icon }, i) => (
          <MenuLink key={href} href={href} label={label} icon={icon} bordered={i > 0} />
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border-2 border-brand-100 bg-white">
        {user ? (
          <>
            <MenuLink href="/account" label={t.settings} icon={Settings} />
            <form action={logoutAction} className="border-t border-brand-100">
              <button
                type="submit"
                className="flex w-full items-center gap-3 px-5 py-4 text-left text-base font-medium text-ink/60 hover:bg-brand-50 active:bg-brand-50"
              >
                <LogOut className="h-5 w-5 shrink-0 text-brand-600" strokeWidth={1.9} />
                {t.logOut}
              </button>
            </form>
          </>
        ) : (
          <>
            <MenuLink href="/login" label={t.logIn} icon={LogIn} />
            <MenuLink href="/signup" label={t.signUp} icon={UserPlus} bordered />
          </>
        )}
      </div>

      {settings.arabicEnabled && (
        <div className="mt-6 rounded-2xl border-2 border-brand-100 bg-white p-6">
          <h2 className="font-display font-semibold text-brand-900">{dict.languageSwitcher.label}</h2>
          <div className="mt-4">
            <LanguageSwitcher locale={locale} dict={dict.languageSwitcher} arabicEnabled={settings.arabicEnabled} />
          </div>
        </div>
      )}

      {user && (
        <div className="mt-6 rounded-2xl border-2 border-red-100 bg-white p-6">
          <h2 className="font-display font-semibold text-red-700">{dict.account.dangerZoneTitle}</h2>
          <p className="mt-1 text-sm text-ink/60">{dict.account.dangerZoneDescription}</p>
          <DeleteAccountForm dict={dict} userId={user.userId} hasPassword={hasPassword} />
        </div>
      )}
    </Container>
  );
}
