import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import WorkshopInterestPopup from "@/components/workshop-interest-popup";
import EntryGates from "@/components/entry-gates";
import ServiceWorkerRegister from "@/components/sw-register";
import InitialSplash from "@/components/initial-splash";
import HelpButton from "@/components/help-button";
import BottomTabBar from "@/components/bottom-tab-bar";
import { CartProvider } from "@/lib/cart-context";
import { CurrencyProvider } from "@/lib/currency-context";
import { getCurrentUser } from "@/lib/session";
import { getLocale, dirForLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getSiteSettings } from "@/lib/site-settings";
import { getSiteTextOverrides, applyOverrides } from "@/lib/site-text";

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
    icon: "/brand/icon-192.png",
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
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [user, locale, settings, textOverrides] = await Promise.all([
    getCurrentUser(),
    getLocale(),
    getSiteSettings(),
    getSiteTextOverrides(),
  ]);
  const baseDict = getDictionary(locale);
  const dict = { ...baseDict, nav: applyOverrides(baseDict.nav, "nav", textOverrides, locale) };

  return (
    <html
      lang={locale}
      dir={dirForLocale(locale)}
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-ink pb-20 md:pb-0">
        <InitialSplash />
        <CurrencyProvider>
          <CartProvider>
            <SiteHeader
              user={user}
              locale={locale}
              dict={dict}
              arabicEnabled={settings.arabicEnabled}
            />
            <main className="flex-1">
              <ViewTransition name="page-content">{children}</ViewTransition>
            </main>
            <SiteFooter locale={locale} dict={dict.footer} />
            <WorkshopInterestPopup />
            <EntryGates />
            <ServiceWorkerRegister />
            <HelpButton dict={dict.helpButton} />
            <BottomTabBar dict={dict.nav} />
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
