// Prepara las imágenes del hero de la Home en WebP.
//
// Uso: npm run prepare:home
//
// Lee el original de scripts/data/home-source/ (fuera del repo, pesa unos 1.7 MB sin pérdida) y
// escribe en public/home/:
//   hero-home.webp          la foto completa (móvil).
//   hero-home-desktop.webp  la foto sin la franja de arriba (escritorio).
//   jirafa-cabeza.webp      esa franja (la cabeza de la jirafa) recortada del cielo, con fondo
//                           transparente; en escritorio se dibuja sobre la cabecera.
// Si cambia el original o el corte, se vuelve a correr y se actualizan los tokens `--home-photo-*`.
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const SOURCE = "scripts/data/home-source/hero-home.webp";
const OUTPUT_DIR = "public/home";

// Franja de la cabeza: desde arriba hasta CUT_Y (justo bajo la boca), y de CUT_LEFT a CUT_LEFT + CUT_WIDTH.
// Si se cambian, actualizar `--home-cutout-*` en tokens.css.
const CUT_Y = 130;
const CUT_LEFT = 620;
const CUT_WIDTH = 200;

mkdirSync(OUTPUT_DIR, { recursive: true });

const { width, height } = await sharp(SOURCE).metadata();

// Móvil: la foto completa, con el tamaño original (1916 por 821).
await sharp(SOURCE).webp({ quality: 78 }).toFile(`${OUTPUT_DIR}/hero-home.webp`);

// Escritorio: la foto sin la franja de arriba. Esa franja va aparte, sobre la cabecera.
await sharp(SOURCE)
  .extract({ left: 0, top: CUT_Y, width, height: height - CUT_Y })
  .webp({ quality: 78 })
  .toFile(`${OUTPUT_DIR}/hero-home-desktop.webp`);

// Cabeza de la jirafa: el cielo es azul y gris (R menor o igual que B) y la jirafa es naranja y crema
// (R mayor que B), así que la diferencia R - B separa bien las dos. Lo oscuro (pompones de los
// cuernos, manchas) también es jirafa. Luego se cierran huecos, se rellena el interior, se deja
// solo la figura más grande y se suaviza el borde un píxel.
const { data, info } = await sharp(SOURCE)
  .extract({ left: CUT_LEFT, top: 0, width: CUT_WIDTH, height: CUT_Y })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;

let mask = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) {
  const r = data[i * 3];
  const g = data[i * 3 + 1];
  const b = data[i * 3 + 2];
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  mask[i] = r - b > 8 || luma < 110 ? 1 : 0;
}

function dilate(src) {
  const out = new Uint8Array(W * H);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let v = 0;
      for (let dy = -1; dy <= 1 && !v; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < W && ny < H && src[ny * W + nx]) {
            v = 1;
            break;
          }
        }
      out[y * W + x] = v;
    }
  return out;
}
function erode(src) {
  const inv = src.map((v) => 1 - v);
  return dilate(inv).map((v) => 1 - v);
}

// Cierre (rellena huecos finos), dos pasadas.
mask = erode(erode(dilate(dilate(mask))));

// Rellena el interior: lo que no se alcanza desde el borde del recorte sin cruzar la figura.
const outside = new Uint8Array(W * H);
const queue = [];
const push = (x, y) => {
  const i = y * W + x;
  if (!mask[i] && !outside[i]) {
    outside[i] = 1;
    queue.push(i);
  }
};
for (let x = 0; x < W; x++) {
  push(x, 0);
  push(x, H - 1);
}
for (let y = 0; y < H; y++) {
  push(0, y);
  push(W - 1, y);
}
while (queue.length) {
  const i = queue.pop();
  const x = i % W;
  const y = (i - x) / W;
  if (x > 0) push(x - 1, y);
  if (x < W - 1) push(x + 1, y);
  if (y > 0) push(x, y - 1);
  if (y < H - 1) push(x, y + 1);
}
for (let i = 0; i < W * H; i++) if (!outside[i]) mask[i] = 1;

// Se queda solo con el componente más grande (la jirafa); quita motas sueltas de nubes.
const label = new Int32Array(W * H);
let best = 0;
let bestSize = 0;
let next = 0;
for (let s = 0; s < W * H; s++) {
  if (!mask[s] || label[s]) continue;
  next++;
  let size = 0;
  const stack = [s];
  label[s] = next;
  while (stack.length) {
    const i = stack.pop();
    size++;
    const x = i % W;
    const y = (i - x) / W;
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (mask[j] && !label[j]) {
        label[j] = next;
        stack.push(j);
      }
    }
  }
  if (size > bestSize) {
    bestSize = size;
    best = next;
  }
}
for (let i = 0; i < W * H; i++) mask[i] = label[i] === best ? 1 : 0;

// Borde: se quita un píxel (para no arrastrar el halo azul del cielo) y se suaviza.
mask = erode(mask);
const alpha = new Uint8Array(W * H);
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    let sum = 0;
    let n = 0;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H) {
          sum += mask[ny * W + nx];
          n++;
        }
      }
    alpha[y * W + x] = Math.round((sum / n) * 255);
  }

const rgba = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) {
  rgba[i * 4] = data[i * 3];
  rgba[i * 4 + 1] = data[i * 3 + 1];
  rgba[i * 4 + 2] = data[i * 3 + 2];
  rgba[i * 4 + 3] = alpha[i];
}
await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(`${OUTPUT_DIR}/jirafa-cabeza.webp`);

console.log("Imágenes de la Home escritas en", OUTPUT_DIR);
