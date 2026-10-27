// El Studio se compila aparte de Next; el ID y el dataset no son secretos.
// "pendiente" se reemplaza con el ID del proyecto de sanity.io/manage (tarea 0.7).
export const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "pendiente";
export const dataset =
  process.env.SANITY_STUDIO_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
