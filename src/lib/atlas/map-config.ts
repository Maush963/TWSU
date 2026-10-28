import type { FittedMapConfig } from "@/lib/atlas/project";

// Imagen del atlas. Está en public/atlas; el tamaño debe coincidir con el archivo real.
export const ATLAS_MAP_IMAGE = {
  src: "/atlas/mapa.png",
  width: 1672,
  height: 941,
} as const;

// Calibración del dibujo contra los contornos de Natural Earth 110m (coincidencia de
// tierra 0.75). El dibujo es estilizado, así que no sigue una proyección estándar.
// Se recalcula con scripts/calibrate-atlas.ts si cambia el PNG.
export const ATLAS_MAP_CONFIG: FittedMapConfig = {
  projection: "fitted",
  image: { width: ATLAS_MAP_IMAGE.width, height: ATLAS_MAP_IMAGE.height },
  origin: { x: 757.8593, y: 575.3455 },
  scale: { x: 4.5969, y: 305.3594 },
  curve: { a: -0.0899, b: -0.017, e: 0.0832, c: 0.1276, d: -0.0172 },
};
