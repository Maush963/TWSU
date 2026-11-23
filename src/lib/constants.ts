// Sin imports: lo comparten Next y Sanity Studio.

export const CATEGORIES = [
  { value: "storytelling", title: "Storytelling" },
  { value: "plataformas", title: "Platforms" },
  { value: "campanas", title: "Campaigns" },
  { value: "branding", title: "Branding" },
  { value: "social-media", title: "Social media" },
] as const;

export const CONTINENTS = [
  { value: "america", title: "Americas" },
  { value: "europa", title: "Europe" },
  { value: "asia", title: "Asia" },
  { value: "africa", title: "Africa" },
  { value: "oceania", title: "Oceania" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];
export type Continent = (typeof CONTINENTS)[number]["value"];

export const ATLAS_SLOTS_PER_CATEGORY = 5;
export const PERSPECTIVES_PAGE_SIZE = 9;
export const RELATED_ARTICLES_LIMIT = 3;
export const HOME_RECENT_LIMIT = 6;

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

// Correo (Fase 3): tiempo máximo de espera al proveedor.
export const MAIL_TIMEOUT_MS = 8000;
