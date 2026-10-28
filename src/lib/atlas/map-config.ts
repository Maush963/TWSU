import { ATLAS_CALIBRATION } from "@/lib/atlas/map-calibration";
import type { FittedMapConfig } from "@/lib/atlas/project";

// Imagen del atlas. Está en public/atlas; el tamaño debe coincidir con el archivo real.
export const ATLAS_MAP_IMAGE = {
  src: "/atlas/mapa.png",
  width: 1672,
  height: 941,
} as const;

// El dibujo es estilizado y no sigue una proyección estándar, así que se calibra contra los
// contornos de Natural Earth 110m. Los valores salen de map-calibration.ts, que genera
// `npm run calibrate:atlas`. Si cambia el PNG, hay que volver a correrlo.
export const ATLAS_MAP_CONFIG: FittedMapConfig = {
  projection: "fitted",
  image: { width: ATLAS_MAP_IMAGE.width, height: ATLAS_MAP_IMAGE.height },
  ...ATLAS_CALIBRATION,
};
