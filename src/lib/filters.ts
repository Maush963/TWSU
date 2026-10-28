import { isCategory, isContinent } from "@/lib/constants";
import type { ArticleFilterParams, AtlasFilterParams } from "@/lib/sanity/types";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const MIN_YEAR = 2000;

// Si el parámetro viene repetido, se usa el primero. Un valor vacío cuenta como ausente.
function first(searchParams: RawSearchParams, key: string): string | undefined {
  const value = searchParams[key];
  const single = Array.isArray(value) ? value[0] : value;
  return single === undefined || single === "" ? undefined : single;
}

function parseInteger(value: string | undefined): number | undefined {
  if (value === undefined || !/^\d+$/.test(value)) return undefined;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : undefined;
}

function parseCategory(searchParams: RawSearchParams) {
  const value = first(searchParams, "category");
  return value !== undefined && isCategory(value) ? value : undefined;
}

/** `year` es un entero de 4 dígitos entre 2000 y el año actual más 1. Lo inválido se ignora. */
export function parseAtlasFilters(
  searchParams: RawSearchParams,
  currentYear: number = new Date().getFullYear(),
): AtlasFilterParams {
  const filters: AtlasFilterParams = {};

  const category = parseCategory(searchParams);
  if (category) filters.category = category;

  const region = first(searchParams, "region");
  if (region !== undefined && isContinent(region)) filters.region = region;

  const rawYear = first(searchParams, "year");
  const year = rawYear?.length === 4 ? parseInteger(rawYear) : undefined;
  if (year !== undefined && year >= MIN_YEAR && year <= currentYear + 1) filters.year = year;

  return filters;
}

/** `page` es un entero mayor o igual a 1; si viene mal, vale 1. */
export function parsePerspectivesFilters(searchParams: RawSearchParams): ArticleFilterParams {
  const category = parseCategory(searchParams);
  const page = parseInteger(first(searchParams, "page"));
  return {
    ...(category ? { category } : {}),
    page: page !== undefined && page >= 1 ? page : 1,
  };
}

/** Inverso de los parsers: omite los valores vacíos y la página 1. */
export function toSearchParams(filters: Partial<AtlasFilterParams & ArticleFilterParams>): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.region) params.set("region", filters.region);
  if (filters.year !== undefined) params.set("year", String(filters.year));
  if (filters.page !== undefined && filters.page > 1) params.set("page", String(filters.page));
  return params;
}
