import { CATEGORIES, type Category } from "@/lib/constants";
import type { AtlasPinData } from "@/lib/sanity/types";

export interface KeyState {
  category: Category;
  title: string;
  active: boolean;
}

/** Siempre devuelve las 5 llaves, en el orden de `CATEGORIES`. */
export function getKeyStates(categories: readonly Category[]): KeyState[] {
  return CATEGORIES.map(({ value, title }) => ({
    category: value,
    title,
    active: categories.includes(value),
  }));
}

/** Cuántos puntos ocupan cada llave. Un artículo con 2 categorías cuenta en las dos. */
export function countByCategory(pins: readonly AtlasPinData[]): Record<Category, number> {
  const counts = Object.fromEntries(CATEGORIES.map(({ value }) => [value, 0])) as Record<Category, number>;
  for (const pin of pins) {
    for (const category of new Set(pin.categories)) counts[category] += 1;
  }
  return counts;
}
