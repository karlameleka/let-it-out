export function formatEGP(amount: number): string {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(amount);
}

const ARABIC_INDIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/** Replaces Western digits (0-9) with Arabic-Indic digits (٠-٩) for display
 * in the Arabic locale — everything else (spaces, +, punctuation) is left
 * untouched, so this is safe to run on formatted strings like phone numbers. */
export function toArabicDigits(value: string): string {
  return value.replace(/[0-9]/g, (d) => ARABIC_INDIC_DIGITS[Number(d)]);
}
