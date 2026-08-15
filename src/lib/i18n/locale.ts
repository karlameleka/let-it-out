import "server-only";
import { cookies } from "next/headers";
import { getSiteSettings } from "@/lib/site-settings";

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "lio_locale";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function dirForLocale(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  const cookieLocale = value && isLocale(value) ? value : DEFAULT_LOCALE;

  // Arabic can be switched off site-wide from /admin/settings. Rather than
  // clearing everyone's locale cookie, a visitor who previously chose
  // Arabic just renders in English until it's turned back on — their
  // preference cookie is untouched, so it resumes automatically.
  if (cookieLocale === "ar") {
    const settings = await getSiteSettings();
    if (!settings.arabicEnabled) return DEFAULT_LOCALE;
  }

  return cookieLocale;
}
