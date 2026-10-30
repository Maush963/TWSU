import { CATEGORIES, type Category } from "@/lib/constants";

/** Títulos de las categorías, en el orden de `CATEGORIES` y sin repetir. */
export function getCategoryTitles(categories: readonly Category[]): string[] {
  return CATEGORIES.filter(({ value }) => categories.includes(value)).map(({ title }) => title);
}
