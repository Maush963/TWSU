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
export const HOME_LARGE_COUNT = 2;
export const HOME_SMALL_COUNT = 4;
export const HOME_RECENT_LIMIT = HOME_LARGE_COUNT + HOME_SMALL_COUNT;

/** Lugar del artículo en la Home: uno solo (grande o pequeño) o ninguno. Es independiente del atlas y de Perspectives. */
export const HOME_FEATURED_OPTIONS = [
  { value: "none", title: "No destacado en la Home" },
  { value: "large", title: "Grande (los 2 de arriba)" },
  { value: "small", title: "Pequeño (los 4 de abajo)" },
] as const;

export type HomeFeatured = Exclude<(typeof HOME_FEATURED_OPTIONS)[number]["value"], "none">;

export function isHomeFeatured(value: string | null | undefined): value is HomeFeatured {
  return value === "large" || value === "small";
}

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

/** Largo máximo del título de un artículo. Con él cabe completo en todos los lugares (máximo 3-4 líneas). */
export const TITLE_MAX_LENGTH = 50;
