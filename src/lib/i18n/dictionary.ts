import type { Locale } from "./locale";
import en from "./dictionaries/en";
import ar from "./dictionaries/ar";
import type { Dictionary } from "./dictionaries/en";

const DICTIONARIES: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export type { Dictionary };
