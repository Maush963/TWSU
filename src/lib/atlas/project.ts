export type MapConfig = {
  projection: "equirectangular" | "mercator";
  bounds: { west: number; east: number; north: number; south: number };
};

// Mundo completo en equirectangular. La calibración con el PNG real es de la Fase 1.
export const DEFAULT_MAP_CONFIG: MapConfig = {
  projection: "equirectangular",
  bounds: { west: -180, east: 180, north: 90, south: -90 },
};

const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

/** Convierte coordenadas en porcentajes (0 a 100) sobre la imagen del mapa. */
export function project(lat: number, lng: number, cfg: MapConfig = DEFAULT_MAP_CONFIG) {
  const { west, east, north, south } = cfg.bounds;
  const x = (lng - west) / (east - west);
  const y =
    cfg.projection === "mercator"
      ? (mercY(north) - mercY(lat)) / (mercY(north) - mercY(south))
      : (north - lat) / (north - south);
  return { x: x * 100, y: y * 100 };
}
