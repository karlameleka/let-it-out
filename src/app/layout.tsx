import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { headers } from "next/headers";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import EntryGates from "@/components/entry-gates";
import { SerwistProvider } from "@serwist/turbopack/react";
import OfflineBanner from "@/components/offline-banner";
import InitialSplash from "@/components/initial-splash";
import NativeAppInit from "@/components/native-app-init";
import MotionProvider from "@/components/motion/motion-provider";
import HelpButton from "@/components/help-button";
import BottomTabBar from "@/components/bottom-tab-bar";
import AppBadgeSync from "@/components/app-badge-sync";
import PushAutoPrompt from "@/components/push-auto-prompt";
import ReferralActivationWatcher from "@/components/referral-activation-watcher";
import AnalyticsTracker from "@/components/analytics-tracker";
import OnboardingRoot from "@/components/onboarding/onboarding-root";
import { CartProvider } from "@/lib/cart-context";
import { CurrencyProvider } from "@/lib/currency-context";
import { UnreadToolsProvider } from "@/lib/unread-tools-context";
import { UpcomingProvider } from "@/lib/upcoming-context";
import { getCurrentUser } from "@/lib/session";
import { getLocale, dirForLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getSiteSettings } from "@/lib/site-settings";
import { getSiteTextOverrides, applyOverrides } from "@/lib/site-text";
import { getOnboardingState } from "@/lib/onboarding";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Let It Out | Mental Health Service",
    template: "%s | Let It Out",
  },
  description:
    "Let It Out is a psychologist-led mental health service founded in 2021, offering online counseling, guided journals, and trainings and workshops rooted in evidence-based care.",
  manifest: "/manifest.webmanifest",
  icons: {
    // Transparent-background mark for the browser tab — the filled teal
    // square (icon-192.png) is reserved for app-icon contexts (PWA install,
    // Android home screen) where a solid background is expected/required.
    icon: "/brand/favicon-teal.png",
    apple: "/brand/icon-180.png",
  },
  appleWebApp: {
    // Without this, iOS uses the full <title> ("Let It Out | Mental Health
    // Service") as the label under the home screen icon, which truncates
    // awkwardly. This also makes the installed app open full-screen
    // (no Safari address bar) instead of as a bookmark.
    title: "Let It Out",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e5b73",
  // Lets the page draw under the iOS notch/home-indicator instead of
  // being letterboxed above it — without this, every env(safe-area-
  // inset-*) reference in the app (the bottom tab bar's padding, the
  // floating help button's position) resolves to 0, so the "safe area"
  // handling silently did nothing.
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const hdrs = await headers();
  // Set by proxy.ts when this request came in on the marketing apex domain
  // (letitouteg.org) — that page brings its own header/footer and isn't
  // part of the installable PWA, so none of the app chrome below
  // (nav, bottom tab bar, install prompts, service worker) applies to it.
  // It also needs none of the app's DB-backed settings/session/text-override
  // lookups, so those are skipped entirely on this path.
  const isMarketingSite = hdrs.get("x-marketing-site") === "1";

  if (isMarketingSite) {
    const locale = await getLocale();
    return (
      <html
        lang={locale}
        dir={dirForLocale(locale)}
        className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-white text-ink">
          <main className="flex-1">{children}</main>
        </body>
      </html>
    );
  }

  const [user, locale, settings, textOverrides] = await Promise.all([
    getCurrentUser(),
    getLocale(),
    getSiteSettings(),
    getSiteTextOverrides(),
  ]);
  const baseDict = getDictionary(locale);
  const dict = { ...baseDict, nav: applyOverrides(baseDict.nav, "nav", textOverrides, locale) };
  const onboardingState = user && user.role === "USER" ? await getOnboardingState(user.userId) : null;

  return (
    <html
      lang={locale}
      dir={dirForLocale(locale)}
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-ink pb-24 lg:pb-0">
        <NativeAppInit />
        <InitialSplash />
        <OfflineBanner message={dict.offline.bannerMessage} />
        <MotionProvider>
          <CurrencyProvider>
            <CartProvider>
              <UnreadToolsProvider>
                <UpcomingProvider>
                  <SiteHeader
                    user={user}
                    locale={locale}
                    dict={dict}
                    arabicEnabled={settings.arabicEnabled}
                  />
                  {/* No flex-1 here on purpose — a "sticky footer" that
                      stretches main to fill the viewport pins the footer to
                      the bottom on every short page (e.g. /menu), which
                      reads as a large empty gap above it and can force a
                      scroll just to reach a footer that's otherwise fully
                      visible already. The footer should just follow
                      whatever content each page actually has. */}
                  <main>
                    <ViewTransition name="page-content">{children}</ViewTransition>
                  </main>
                  <SiteFooter locale={locale} dict={dict} />
                  <EntryGates />
                  <SerwistProvider swUrl="/serwist/sw.js" />
                  <HelpButton dict={dict.helpButton} />
                  <BottomTabBar dict={dict.nav} />
                  <AppBadgeSync />
                  <PushAutoPrompt loggedIn={Boolean(user)} />
                  <ReferralActivationWatcher />
                  {user && <AnalyticsTracker />}
                  {(!user || user.role === "USER") && (
                    <OnboardingRoot
                      loggedIn={Boolean(user)}
                      firstName={user?.name.split(" ")[0] ?? ""}
                      accountState={onboardingState}
                      dict={dict.onboarding}
                      installDict={dict.install}
                    />
                  )}
                </UpcomingProvider>
              </UnreadToolsProvider>
            </CartProvider>
          </CurrencyProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
