"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isLocale, LOCALE_COOKIE, type Locale } from "./locale";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });

  // Best-effort — keeps this device's push subscription (if any) sending
  // future broadcast notifications in the language just chosen, not
  // whatever locale was active when the browser first subscribed.
  const user = await getCurrentUser().catch(() => null);
  if (user) {
    await prisma.pushSubscription.updateMany({ where: { userId: user.userId }, data: { locale } }).catch(() => {});
  }

  revalidatePath("/", "layout");
}
