// Sin imports: lo comparten Next y Sanity Studio.

export const CATEGORIES = [
  { value: "storytelling", title: "Storytelling" },
  { value: "plataformas", title: "Plataformas" },
  { value: "campanas", title: "Campañas" },
  { value: "branding", title: "Branding" },
  { value: "social-media", title: "Social media" },
] as const;

export const CONTINENTS = [
  { value: "america", title: "América" },
  { value: "europa", title: "Europa" },
  { value: "asia", title: "Asia" },
  { value: "africa", title: "África" },
  { value: "oceania", title: "Oceanía" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];
export type Continent = (typeof CONTINENTS)[number]["value"];

export const ATLAS_SLOTS_PER_CATEGORY = 10;
export const PERSPECTIVES_PAGE_SIZE = 9;
export const RELATED_ARTICLES_LIMIT = 3;
export const HOME_RECENT_LIMIT = 3;

export function isCategory(value: string): value is Category {
  return CATEGORIES.some((category) => category.value === value);
}

export function isContinent(value: string): value is Continent {
  return CONTINENTS.some((continent) => continent.value === value);
}

// Formularios y antispam (Fase 3).
export const MIN_FILL_MS = 3000;
export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
export const EMAIL_MAX_LENGTH = 254;
export const NAME_MAX_LENGTH = 100;
export const COMPANY_MAX_LENGTH = 120;
export const PHONE_MIN_DIGITS = 7;
export const PHONE_MAX_LENGTH = 25;
export const MESSAGE_MAX_LENGTH = 2000;
