import { CATEGORIES, type Category } from "@/lib/constants";
import { toSearchParams } from "@/lib/filters";
import type { ArticleFilterParams } from "@/lib/sanity/types";

export const PERSPECTIVES_PATH = "/perspectives";

export interface CategoryFilterLink {
  value: Category;
  title: string;
  href: string;
  active: boolean;
}

export interface PerspectivesFilterLinks {
  categories: CategoryFilterLink[];
  /** Enlace que quita la categoría. */
  allHref: string;
  hasActiveFilters: boolean;
}

/** Arma la URL del listado. La página 1 y los valores vacíos no se escriben. */
export function perspectivesHref(filters: Partial<ArticleFilterParams>): string {
  const query = toSearchParams(filters).toString();
  return query ? `${PERSPECTIVES_PATH}?${query}` : PERSPECTIVES_PATH;
}

/** Elegir una categoría siempre lleva a la página 1; elegir la activa la quita. */
export function buildPerspectivesFilterLinks(current: ArticleFilterParams): PerspectivesFilterLinks {
  return {
    categories: CATEGORIES.map(({ value, title }) => ({
      value,
      title,
      href: perspectivesHref(current.category === value ? {} : { category: value }),
      active: current.category === value,
    })),
    allHref: PERSPECTIVES_PATH,
    hasActiveFilters: current.category !== undefined,
  };
}
