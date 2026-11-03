// Prepara las imágenes de About (y el hero que comparte con la Home): recorta cada personaje a busto y convierte todo a WebP.
//
// Uso: npm run prepare:about
//
// Lee los originales de scripts/data/about-source/ (fuera del repo, pesan unos 2 MB cada uno) y
// escribe public/about/*.webp. Si cambian los originales o el encuadre, se vuelve a correr.
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const SOURCE_DIR = "scripts/data/about-source";
const OUTPUT_DIR = "public/about";

// Los retratos miden 1024 por 1536. Cada recorte es de 640 por 600 (la proporción de la tarjeta
// del diseño) y se coloca sobre la cabeza de cada personaje.
const CROP_WIDTH = 640;
const CROP_HEIGHT = 600;
const OUTPUT_WIDTH = 720;
const PORTRAITS = [
  { file: "PandaLu", left: 124, top: 200 },
  { file: "Gere", left: 210, top: 40 },
  { file: "Stan", left: 200, top: 20 },
  { file: "Kaia", left: 226, top: 40 },
  { file: "Camille", left: 192, top: 95 },
];

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const { file, left, top } of PORTRAITS) {
  await sharp(`${SOURCE_DIR}/${file}.png`)
    .extract({ left, top, width: CROP_WIDTH, height: CROP_HEIGHT })
    .resize({ width: OUTPUT_WIDTH })
    .webp({ quality: 80 })
    .toFile(`${OUTPUT_DIR}/${file.toLowerCase()}.webp`);
}

// Fondo de "The Council of Five". Es un adorno: va suave y a 1672 px de ancho.
await sharp(`${SOURCE_DIR}/fondo-consejo.png`).webp({ quality: 70 }).toFile(`${OUTPUT_DIR}/fondo-consejo.webp`);

// Hero de About y de la Home: los cinco personajes sobre la pared. Conserva el tamaño original.
await sharp(`${SOURCE_DIR}/hero-personajes.png`).webp({ quality: 80 }).toFile(`${OUTPUT_DIR}/hero-personajes.webp`);

console.log("Imágenes de About escritas en", OUTPUT_DIR);
