import { CATEGORIES, CONTINENTS, type Category, type Continent } from "@/lib/constants";
import { toSearchParams } from "@/lib/filters";
import type { AtlasFilterParams } from "@/lib/sanity/types";

export const ATLAS_PATH = "/atlas";

export interface FilterLink<T> {
  value: T;
  title: string;
  href: string;
  active: boolean;
}

export interface AtlasFilterLinks {
  categories: FilterLink<Category>[];
  /** Enlace que quita solo la categoría y conserva región y año. */
  allCategoriesHref: string;
  regions: FilterLink<Continent>[];
  years: FilterLink<number>[];
  clearHref: string;
  hasActiveFilters: boolean;
}

/**
 * Año que se muestra de verdad: el de la URL si tiene datos y, si no, el más reciente.
 * `years` viene ordenado del más reciente al más antiguo.
 */
export function resolveAtlasYear(year: number | undefined, years: readonly number[]): number | undefined {
  if (year !== undefined && years.includes(year)) return year;
  return years[0];
}

function buildHref(filters: AtlasFilterParams, defaultYear: number | undefined): string {
  // El año por defecto no se escribe en la URL.
  const { year, ...rest } = filters;
  const query = toSearchParams({
    ...rest,
    ...(year !== undefined && year !== defaultYear ? { year } : {}),
  }).toString();
  return query ? `${ATLAS_PATH}?${query}` : ATLAS_PATH;
}

/** Quita el filtro si ya está activo; si no, lo pone. Los demás filtros se conservan. */
function toggled<K extends keyof AtlasFilterParams>(
  current: AtlasFilterParams,
  key: K,
  value: NonNullable<AtlasFilterParams[K]>,
): AtlasFilterParams {
  const { [key]: previous, ...others } = current;
  return previous === value ? others : { ...others, [key]: value };
}

function withoutCategory(filters: AtlasFilterParams): AtlasFilterParams {
  const copy = { ...filters };
  delete copy.category;
  return copy;
}

export function buildAtlasFilterLinks(
  current: AtlasFilterParams,
  years: readonly number[],
): AtlasFilterLinks {
  const defaultYear = years[0];
  const year = resolveAtlasYear(current.year, years);
  // A partir de aquí se trabaja con el año ya resuelto.
  const resolved: AtlasFilterParams = {
    ...(current.category ? { category: current.category } : {}),
    ...(current.region ? { region: current.region } : {}),
    ...(year !== undefined ? { year } : {}),
  };

  return {
    categories: CATEGORIES.map(({ value, title }) => ({
      value,
      title,
      href: buildHref(toggled(resolved, "category", value), defaultYear),
      active: resolved.category === value,
    })),
    allCategoriesHref: buildHref(withoutCategory(resolved), defaultYear),
    regions: CONTINENTS.map(({ value, title }) => ({
      value,
      title,
      href: buildHref(toggled(resolved, "region", value), defaultYear),
      active: resolved.region === value,
    })),
    years: years.map((value) => ({
      value,
      title: String(value),
      href: buildHref({ ...resolved, year: value }, defaultYear),
      active: year === value,
    })),
    clearHref: ATLAS_PATH,
    hasActiveFilters: Boolean(resolved.category || resolved.region || (year !== undefined && year !== defaultYear)),
  };
}
