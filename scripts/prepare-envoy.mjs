// Prepara las imágenes del bloque "The Envoy" de la Home en WebP con fondo transparente.
//
// Uso: npm run prepare:envoy
//
// Lee de scripts/data/home-source/ (fuera del repo) y escribe en public/home/:
//   envoy-ilustracion.webp  el boceto de los cinco personajes, en verde del acento, con la
//                           transparencia sacada de lo oscuro del dibujo (el fondo gris desaparece).
//   envoy-marco.webp        el marco tipo sello postal en dorado, recortado al contorno, para usarlo
//                           como `border-image` (se estira por los lados sin deformar las esquinas).
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const SOURCE_DIR = "scripts/data/home-source";
const OUTPUT_DIR = "public/home";
const BG = 247; // gris del fondo de los originales
const ACCENT = [5, 49, 34]; // --color-accent
const GOLD = [226, 180, 124]; // --color-gold

mkdirSync(OUTPUT_DIR, { recursive: true });

// Convierte un original con fondo gris en un RGBA de un solo color: el alfa sale de cuánto se
// aleja cada píxel del fondo. `floor` es el valor de gris al que ya se considera trazo completo.
async function toTransparent(file, color, floor) {
  const { data, info } = await sharp(`${SOURCE_DIR}/${file}`).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const darkest = Math.min(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
    const alpha = Math.max(0, Math.min(1, (BG - darkest) / (BG - floor)));
    out[i * 4] = color[0];
    out[i * 4 + 1] = color[1];
    out[i * 4 + 2] = color[2];
    out[i * 4 + 3] = Math.round(alpha * 255);
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
}

// Ilustración: se recorta al dibujo y se reduce (se muestra a unos 600 px de ancho como mucho).
const illustration = await toTransparent("envoy-ilustracion.jpg", ACCENT, 90);
await illustration
  .trim({ threshold: 8 })
  .resize({ width: 1100, withoutEnlargement: true })
  .webp({ quality: 85, alphaQuality: 90 })
  .toFile(`${OUTPUT_DIR}/envoy-ilustracion.webp`);

// Marco: recortado al contorno y reducido; el borde se parte en 9 trozos con `border-image`.
const frame = await toTransparent("envoy-marco.jpg", GOLD, 150);
await frame
  .trim({ threshold: 8 })
  .resize({ width: 720 })
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(`${OUTPUT_DIR}/envoy-marco.webp`);

for (const name of ["envoy-ilustracion", "envoy-marco"]) {
  const { width, height } = await sharp(`${OUTPUT_DIR}/${name}.webp`).metadata();
  console.log(name, width, height);
}
