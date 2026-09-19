const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

/** "Saturday 19 Sept 2026" — a fixed, locale-independent long-date format
 * for a date-only value (no time component). Deliberately not
 * `toLocaleDateString`: Node and browsers ship different ICU data, so the
 * same locale/options pair can render different punctuation (a comma
 * after the weekday, in this case) between server and client, which
 * breaks hydration on anything rendered server-side first. Reads UTC date
 * parts specifically — a `@db.Date` column like ClientNote.sessionDate
 * arrives as a JS Date at UTC midnight, so using local getters here would
 * also risk the day shifting by one depending on the runtime's timezone. */
export function formatLongDate(date: Date): string {
  const weekday = WEEKDAYS[date.getUTCDay()];
  const day = date.getUTCDate();
  const month = MONTHS_SHORT[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${weekday} ${day} ${month} ${year}`;
}

export function formatEGP(amount: number): string {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(amount);
}

const ARABIC_INDIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** Converts Western digits (0-9) in a string to Arabic-Indic digits (٠-٩). */
export function toArabicDigits(value: string): string {
  return value.replace(/[0-9]/g, (d) => ARABIC_INDIC_DIGITS[Number(d)]);
}
