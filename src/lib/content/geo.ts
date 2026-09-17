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

/**
 * Every UN member/observer state (plus a few widely-recognized others),
 * Egypt pinned first since it's the primary market, everything else
 * alphabetical, "Other" last as a catch-all.
 */
export const COUNTRIES = [
  "Egypt",
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (Republic of the)",
  "Congo (Democratic Republic of the)",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
  "Other",
];

/**
 * Signup demographics — required, collected once at signup. Mirrors
 * Google's own gender dropdown: these three plus a "Custom" option that
 * reveals a free-text field (see GENDER_CUSTOM below) rather than being a
 * storable value itself — whatever the person types becomes the stored
 * gender in that case.
 */
export const GENDERS = ["Male", "Female", "Rather not say"];

/**
 * Arabic display labels, index-aligned with GENDERS. The submitted form
 * value always stays the canonical English string (stored in the DB and
 * surfaced in the English-only admin dashboard / CRM) — only the label
 * shown to Arabic-locale signups changes.
 */
export const GENDERS_AR = ["ذكر", "أنثى", "تفضل عدم القول"];

/** Sentinel dropdown value that reveals the free-text "Custom" gender field. */
export const GENDER_CUSTOM = "Custom";
export const GENDER_CUSTOM_AR = "مخصص";

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const MONTHS_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

/**
 * Number of days in a given birthday month, so the Day dropdown only offers
 * valid choices (leap years included). Falls back to a 31-day month when
 * nothing is picked yet, and to a leap year (so Feb 29 stays available)
 * until a year is chosen — matching how Google's own birthday picker
 * behaves before both fields are set.
 */
export function daysInMonth(month: number | null, year: number | null): number {
  if (!month) return 31;
  const y = year && year > 0 ? year : 2000;
  return new Date(y, month, 0).getDate();
}

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
