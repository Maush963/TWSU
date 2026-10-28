import { ATLAS_MAP_CONFIG } from "@/lib/atlas/map-config";

export type BoundsMapConfig = {
  projection: "equirectangular" | "mercator";
  bounds: { west: number; east: number; north: number; south: number };
};

/**
 * Corrección local sobre el modelo suave, en píxeles de la imagen. Es una malla de
 * `cols` por `rows` celdas con un nodo por esquina, de izquierda a derecha y de arriba
 * abajo, y se interpola de forma bilinear.
 */
export type MapWarp = {
  cols: number;
  rows: number;
  dx: readonly number[];
  dy: readonly number[];
};

/**
 * Ajuste empírico para un dibujo que no sigue una proyección estándar.
 * Con p = latitud en radianes y dl = longitud entre -180 y 180:
 *   x = origin.x + scale.x * dl * (1 + a p² + b p⁴ + e (dl/180)²)
 *   y = origin.y - scale.y * p * (1 + c p² + d p⁴)
 * Las posiciones salen en píxeles de la imagen, se corrigen con `warp` y se convierten a
 * porcentaje.
 */
export type FittedMapConfig = {
  projection: "fitted";
  image: { width: number; height: number };
  /** Píxel donde cae la latitud 0 y la longitud 0. */
  origin: { x: number; y: number };
  /** Píxeles por grado de longitud y por radián de latitud. */
  scale: { x: number; y: number };
  curve: { a: number; b: number; e: number; c: number; d: number };
  warp?: MapWarp;
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

/** Desplazamiento de la malla en un píxel de la imagen. */
function warpOffset(warp: MapWarp, image: { width: number; height: number }, px: number, py: number) {
  const { cols, rows, dx, dy } = warp;
  const gx = Math.min(cols - 1e-6, Math.max(0, (px / image.width) * cols));
  const gy = Math.min(rows - 1e-6, Math.max(0, (py / image.height) * rows));
  const i = Math.floor(gx);
  const j = Math.floor(gy);
  const fx = gx - i;
  const fy = gy - j;
  const stride = cols + 1;
  const nodes = [j * stride + i, j * stride + i + 1, (j + 1) * stride + i, (j + 1) * stride + i + 1];
  const weights = [(1 - fx) * (1 - fy), fx * (1 - fy), (1 - fx) * fy, fx * fy];
  let offsetX = 0;
  let offsetY = 0;
  nodes.forEach((node, k) => {
    offsetX += (weights[k] ?? 0) * (dx[node] ?? 0);
    offsetY += (weights[k] ?? 0) * (dy[node] ?? 0);
  });
  return { x: offsetX, y: offsetY };
}

/** Convierte coordenadas en porcentajes (0 a 100) sobre la imagen del mapa. */
export function project(lat: number, lng: number, cfg: MapConfig = ATLAS_MAP_CONFIG) {
  if (cfg.projection === "fitted") {
    const { image, origin, scale, curve, warp } = cfg;
    const phi = (lat * Math.PI) / 180;
    const phi2 = phi * phi;
    const dl = wrapLongitude(lng);
    const q = dl / 180;
    let px = origin.x + scale.x * dl * (1 + curve.a * phi2 + curve.b * phi2 * phi2 + curve.e * q * q);
    let py = origin.y - scale.y * phi * (1 + curve.c * phi2 + curve.d * phi2 * phi2);
    if (warp) {
      const offset = warpOffset(warp, image, px, py);
      px += offset.x;
      py += offset.y;
    }
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
