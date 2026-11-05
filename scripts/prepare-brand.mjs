// Prepara las imágenes de marca (logo, llaves, divisor con borla y rosa de los vientos) en WebP.
//
// Uso: npm run prepare:brand
//
// Lee los originales PNG de scripts/data/brand-source/ y escribe:
//   public/brand/   logo, una llave por categoría y el divisor con la borla del pie
//   public/atlas/   rosa de los vientos del mapa
// Todos conservan la transparencia. `borla.png` (la borla sola) no se usa: el divisor ya la trae.
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const SOURCE_DIR = "scripts/data/brand-source";
mkdirSync("public/brand", { recursive: true });

// width = ancho máximo de salida (con margen para pantallas 2x); nunca se amplía.
const IMAGES = [
  { file: "logo", out: "public/brand/logo.webp", width: 1200 },
  { file: "divisor-borla", out: "public/brand/divisor-borla.webp", width: 2400 },
  { file: "llave-storytelling", out: "public/brand/llave-storytelling.webp", width: 640 },
  { file: "llave-plataformas", out: "public/brand/llave-plataformas.webp", width: 640 },
  { file: "llave-campanas", out: "public/brand/llave-campanas.webp", width: 640 },
  { file: "llave-branding", out: "public/brand/llave-branding.webp", width: 640 },
  { file: "llave-social-media", out: "public/brand/llave-social-media.webp", width: 640 },
  { file: "rosa-vientos", out: "public/atlas/rosa-vientos.webp", width: 512 },
];

for (const { file, out, width } of IMAGES) {
  await sharp(`${SOURCE_DIR}/${file}.png`)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(out);
}
