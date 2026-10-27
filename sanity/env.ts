// El Studio se compila aparte de Next; el ID y el dataset no son secretos.
// ID del proyecto TWSU en sanity.io/manage.
export const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "9a1cr0st";
export const dataset =
  process.env.SANITY_STUDIO_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
