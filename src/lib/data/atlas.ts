import "server-only";
import { sanityFetch } from "@/lib/sanity/client";
import { ATLAS_PINS_QUERY, ATLAS_YEARS_QUERY } from "@/lib/sanity/queries";
import type { ATLAS_PINS_QUERY_RESULT, ATLAS_YEARS_QUERY_RESULT } from "@/lib/sanity/sanity.types";
import type { AtlasFilterParams, AtlasPinData } from "@/lib/sanity/types";
import { compact, toAtlasPin } from "./mappers";

const TAGS = ["article", "place"];

/** Años con puntos en el atlas, del más reciente al más antiguo. */
export async function getAtlasYears(): Promise<number[]> {
  const raw = await sanityFetch<ATLAS_YEARS_QUERY_RESULT>(ATLAS_YEARS_QUERY, {}, TAGS);
  return raw.filter((year): year is number => typeof year === "number").sort((a, b) => b - a);
}

/** Sin `year`, usa el año más reciente que tenga datos. */
export async function getAtlasPins(filters: AtlasFilterParams): Promise<AtlasPinData[]> {
  const year = filters.year ?? (await getAtlasYears())[0];
  if (year === undefined) return [];
  const raw = await sanityFetch<ATLAS_PINS_QUERY_RESULT>(
    ATLAS_PINS_QUERY,
    { year, category: filters.category ?? null, region: filters.region ?? null },
    TAGS,
  );
  return compact(raw.map(toAtlasPin));
}
