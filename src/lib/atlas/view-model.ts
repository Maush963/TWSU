import { CONTINENTS, type Category, type Continent } from "@/lib/constants";
import type { AtlasFilterParams, AtlasPinData } from "@/lib/sanity/types";
import { DEFAULT_SPREAD_OPTIONS, spreadPins, type PositionedPin, type SpreadOptions } from "./collisions";
import { buildAtlasFilterLinks, type AtlasFilterLinks } from "./filter-links";
import { countByCategory } from "./keys";
import { ATLAS_MAP_IMAGE } from "./map-config";

// El círculo de separación usa la proporción real del mapa para verse redondo.
const ATLAS_SPREAD_OPTIONS: SpreadOptions = {
  ...DEFAULT_SPREAD_OPTIONS,
  aspectRatio: ATLAS_MAP_IMAGE.width / ATLAS_MAP_IMAGE.height,
};

export interface AtlasRegionGroup {
  continent: Continent;
  title: string;
  pins: AtlasPinData[];
}

export interface AtlasView {
  /** Puntos con la posición a dibujar, en el orden en que se recorren con teclado. */
  positioned: PositionedPin[];
  counts: Record<Category, number>;
  /** Puntos por continente, en el orden de `CONTINENTS` y sin continentes vacíos. Lo usa el móvil. */
  byRegion: AtlasRegionGroup[];
  links: AtlasFilterLinks;
  isEmpty: boolean;
}

function compareTitles(a: AtlasPinData, b: AtlasPinData): number {
  return (
    a.title.localeCompare(b.title, "es") ||
    (a.slug === b.slug ? 0 : a.slug < b.slug ? -1 : 1) ||
    (a.id === b.id ? 0 : a.id < b.id ? -1 : 1)
  );
}

function groupByRegion(pins: readonly AtlasPinData[]): AtlasRegionGroup[] {
  return CONTINENTS.map(({ value, title }) => ({
    continent: value,
    title,
    pins: pins.filter((pin) => pin.continent === value).sort(compareTitles),
  })).filter((group) => group.pins.length > 0);
}

/** Junta toda la lógica del Atlas. Escritorio y móvil leen de aquí, así muestran lo mismo. */
export function buildAtlasView(
  pins: readonly AtlasPinData[],
  filters: AtlasFilterParams,
  years: readonly number[],
  spreadOptions: SpreadOptions = ATLAS_SPREAD_OPTIONS,
): AtlasView {
  const byRegion = groupByRegion(pins);

  // El orden de recorrido con teclado sigue a `byRegion`, no la posición en pantalla.
  const spread = new Map(spreadPins([...pins], spreadOptions).map((pin) => [pin.id, pin]));
  const positioned = byRegion
    .flatMap((group) => group.pins)
    .flatMap((pin) => {
      const placed = spread.get(pin.id);
      return placed ? [placed] : [];
    });

  return {
    positioned,
    counts: countByCategory(pins),
    byRegion,
    links: buildAtlasFilterLinks(filters, years),
    isEmpty: pins.length === 0,
  };
}
