import { ATLAS_MAP_CONFIG } from "@/lib/atlas/map-config";

export type BoundsMapConfig = {
  projection: "equirectangular" | "mercator";
  bounds: { west: number; east: number; north: number; south: number };
};

/**
 * Ajuste empírico para un dibujo que no sigue una proyección estándar.
 * Con p = latitud en radianes y dl = longitud entre -180 y 180:
 *   x = origin.x + scale.x * dl * (1 + a p² + b p⁴ + e (dl/180)²)
 *   y = origin.y - scale.y * p * (1 + c p² + d p⁴)
 * Las posiciones salen en píxeles de la imagen y se convierten a porcentaje.
 */
export type FittedMapConfig = {
  projection: "fitted";
  image: { width: number; height: number };
  /** Píxel donde cae la latitud 0 y la longitud 0. */
  origin: { x: number; y: number };
  /** Píxeles por grado de longitud y por radián de latitud. */
  scale: { x: number; y: number };
  curve: { a: number; b: number; e: number; c: number; d: number };
};

export type MapConfig = BoundsMapConfig | FittedMapConfig;

// Mundo completo en equirectangular. Sirve de referencia matemática; el atlas usa ATLAS_MAP_CONFIG.
export const DEFAULT_MAP_CONFIG: MapConfig = {
  projection: "equirectangular",
  bounds: { west: -180, east: 180, north: 90, south: -90 },
};

const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

function wrapLongitude(lng: number): number {
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}

/** Convierte coordenadas en porcentajes (0 a 100) sobre la imagen del mapa. */
export function project(lat: number, lng: number, cfg: MapConfig = ATLAS_MAP_CONFIG) {
  if (cfg.projection === "fitted") {
    const { image, origin, scale, curve } = cfg;
    const phi = (lat * Math.PI) / 180;
    const phi2 = phi * phi;
    const dl = wrapLongitude(lng);
    const q = dl / 180;
    const px = origin.x + scale.x * dl * (1 + curve.a * phi2 + curve.b * phi2 * phi2 + curve.e * q * q);
    const py = origin.y - scale.y * phi * (1 + curve.c * phi2 + curve.d * phi2 * phi2);
    // El dibujo no cubre el extremo oeste del Pacífico: lo que queda fuera se pega al borde.
    const clamp = (value: number) => Math.min(100, Math.max(0, value));
    return { x: clamp((px / image.width) * 100), y: clamp((py / image.height) * 100) };
  }

  const { west, east, north, south } = cfg.bounds;
  const x = (lng - west) / (east - west);
  const y =
    cfg.projection === "mercator"
      ? (mercY(north) - mercY(lat)) / (mercY(north) - mercY(south))
      : (north - lat) / (north - south);
  return { x: x * 100, y: y * 100 };
}
