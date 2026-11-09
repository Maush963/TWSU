// Prepara la imagen del hero de la Home: la comprime a WebP.
//
// Uso: npm run prepare:home
//
// Lee el original de scripts/data/home-source/ (fuera del repo, pesa unos 1.7 MB sin pérdida) y
// escribe public/home/hero-home.webp. Si cambia el original, se vuelve a correr.
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const SOURCE = "scripts/data/home-source/hero-home.webp";
const OUTPUT_DIR = "public/home";

mkdirSync(OUTPUT_DIR, { recursive: true });

// Conserva el tamaño original (1916 por 821); la proporción está en `--home-banner-ratio`.
await sharp(SOURCE).webp({ quality: 78 }).toFile(`${OUTPUT_DIR}/hero-home.webp`);

console.log("Imagen de la Home escrita en", OUTPUT_DIR);
