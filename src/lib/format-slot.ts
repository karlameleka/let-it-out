import type { Locale } from "@/lib/i18n/locale";

/** Formats a "HH:mm" slot start time as its 50-minute range, e.g. "10:00 – 10:50". */
export function formatSlotTime(time: string, locale: Locale) {
  const [h, m] = time.split(":").map(Number);
  const end = new Date(2000, 0, 1, h, m + 50);
  const fmt = (d: Date) =>
    d.toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-GB", { hour: "numeric", minute: "2-digit" });
  return `${fmt(new Date(2000, 0, 1, h, m))} – ${fmt(end)}`;
}
