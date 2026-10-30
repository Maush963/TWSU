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
