// Prepara la imagen del hero de la Home en WebP.
//
// Uso: npm run prepare:home
//
// Lee el original de scripts/data/home-source/ (fuera del repo, pesa unos 1.7 MB sin pérdida) y
// escribe public/home/hero-home.webp: la foto completa, la misma en móvil y en escritorio.
// Si cambia el original, se vuelve a correr y se actualiza `--home-photo-ratio` en tokens.css.
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const SOURCE = "scripts/data/home-source/hero-home.webp";
const OUTPUT_DIR = "public/home";

mkdirSync(OUTPUT_DIR, { recursive: true });
await sharp(SOURCE).webp({ quality: 78 }).toFile(`${OUTPUT_DIR}/hero-home.webp`);
console.log("Imagen de la Home escrita en", OUTPUT_DIR);
