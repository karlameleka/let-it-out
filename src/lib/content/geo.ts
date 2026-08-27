export const EGYPT_GOVERNORATES = [
  "Cairo",
  "Alexandria",
  "Giza",
  "Qalyubia",
  "Port Said",
  "Suez",
  "Luxor",
  "Aswan",
  "Asyut",
  "Beheira",
  "Beni Suef",
  "Dakahlia",
  "Damietta",
  "Faiyum",
  "Gharbia",
  "Ismailia",
  "Kafr El Sheikh",
  "Matrouh",
  "Minya",
  "Monufia",
  "New Valley",
  "North Sinai",
  "Qena",
  "Red Sea",
  "Sharqia",
  "Sohag",
  "South Sinai",
];

/** Countries list, Egypt pinned first since it's the primary market. */
export const COUNTRIES = [
  "Egypt",
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Bahrain",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Canada",
  "China",
  "Colombia",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Ethiopia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "India",
  "Indonesia",
  "Iraq",
  "Ireland",
  "Italy",
  "Japan",
  "Jordan",
  "Kenya",
  "Kuwait",
  "Lebanon",
  "Libya",
  "Malaysia",
  "Malta",
  "Mexico",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Saudi Arabia",
  "Singapore",
  "South Africa",
  "South Korea",
  "Spain",
  "Sudan",
  "Sweden",
  "Switzerland",
  "Syria",
  "Thailand",
  "Tunisia",
  "Turkey",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Yemen",
  "Other",
];

/** Signup demographics — required, collected once at signup. */
export const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];

/**
 * Arabic display labels, index-aligned with GENDERS. The submitted form
 * value always stays the canonical English string (stored in the DB and
 * surfaced in the English-only admin dashboard / CRM) — only the label
 * shown to Arabic-locale signups changes.
 */
export const GENDERS_AR = ["أنثى", "ذكر", "غير ثنائي", "أفضل عدم القول"];

export const REFERRAL_SOURCES = [
  "Social media",
  "Search engine",
  "Friend or family",
  "Workshop or employer",
  "Other",
];

export const REFERRAL_SOURCES_AR = [
  "وسائل التواصل الاجتماعي",
  "محرك بحث",
  "صديق أو أحد أفراد العائلة",
  "ورشة عمل أو جهة عمل",
  "غير ذلك",
];

/** What the person is hoping to use Let It Out for — multi-select at signup. */
export const SERVICE_INTERESTS = ["Journaling", "Counseling", "Workshops", "Psychoeducation", "Still exploring"];

export const SERVICE_INTERESTS_AR = ["التدوين اليومي", "الاستشارات النفسية", "ورش العمل", "التوعية النفسية", "لسه بستكشف"];

/** Birth years for the signup dropdown, newest first, covering ages 13–100. */
const CURRENT_YEAR = new Date().getFullYear();
const MIN_SIGNUP_AGE = 13;
const MAX_SIGNUP_AGE = 100;
export const BIRTH_YEARS = Array.from(
  { length: MAX_SIGNUP_AGE - MIN_SIGNUP_AGE + 1 },
  (_, i) => CURRENT_YEAR - MIN_SIGNUP_AGE - i,
);
