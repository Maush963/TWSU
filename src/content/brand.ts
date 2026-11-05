// Imágenes de marca (se generan con `npm run prepare:brand`).
// Cada categoría tiene su llave; el orden y la forma salen del diseño del cliente.
import type { Category } from "@/lib/constants";

export const BRAND_IMAGES = {
  logo: { src: "/brand/logo.webp", width: 1200, height: 333 },
  divider: { src: "/brand/divisor-borla.webp", width: 2400, height: 71 },
  compass: { src: "/atlas/rosa-vientos.webp", width: 512, height: 512 },
} as const;

export const KEY_IMAGES: Record<
  Category,
  { src: string; width: number; height: number }
> = {
  storytelling: {
    src: "/brand/llave-storytelling.webp",
    width: 640,
    height: 186,
  },
  plataformas: {
    src: "/brand/llave-plataformas.webp",
    width: 640,
    height: 231,
  },
  campanas: { src: "/brand/llave-campanas.webp", width: 640, height: 120 },
  branding: { src: "/brand/llave-branding.webp", width: 640, height: 225 },
  "social-media": {
    src: "/brand/llave-social-media.webp",
    width: 640,
    height: 187,
  },
};
