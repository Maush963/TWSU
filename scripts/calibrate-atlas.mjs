// Calibra la posición del mapa del atlas contra los contornos reales de los continentes.
//
// Uso: npm run calibrate:atlas
//
// Descarga Natural Earth 110m (dominio público), proyecta la tierra con un modelo flexible y
// busca los parámetros que más se parecen a la tierra de public/atlas/mapa.png.
// Imprime el objeto para pegarlo en src/lib/atlas/map-config.ts.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const LAND_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson";
const IMAGE_PATH = "public/atlas/mapa.png";
const CACHE_PATH = join(tmpdir(), "ne_110m_land.geojson");
const STEP = 4; // el PNG se reduce 4 veces para comparar más rápido
const GRID_W = 1440; // grados * 4
const GRID_H = 720;

async function loadLandGeoJson() {
  if (!existsSync(CACHE_PATH)) {
    const response = await fetch(LAND_URL);
    if (!response.ok) throw new Error(`No se pudo descargar ${LAND_URL}: ${response.status}`);
    writeFileSync(CACHE_PATH, await response.text());
  }
  return JSON.parse(readFileSync(CACHE_PATH, "utf8"));
}

// Tierra en una cuadrícula equirectangular de 0.25 grados, con la regla par-impar por polígono.
function rasterizeLand(geojson) {
  const grid = new Uint8Array(GRID_W * GRID_H);
  for (const feature of geojson.features) {
    const { type, coordinates } = feature.geometry;
    const polygons = type === "Polygon" ? [coordinates] : coordinates;
    for (const polygon of polygons) {
      for (let row = 0; row < GRID_H; row++) {
        const lat = 90 - (row + 0.5) / 4;
        const crossings = [];
        for (const ring of polygon) {
          for (let i = 0; i < ring.length - 1; i++) {
            const [x1, y1] = ring[i];
            const [x2, y2] = ring[i + 1];
            if ((y1 <= lat && y2 > lat) || (y2 <= lat && y1 > lat)) {
              crossings.push(x1 + ((lat - y1) / (y2 - y1)) * (x2 - x1));
            }
          }
        }
        crossings.sort((a, b) => a - b);
        for (let k = 0; k + 1 < crossings.length; k += 2) {
          const from = Math.max(0, Math.round((crossings[k] + 180) * 4));
          const to = Math.min(GRID_W - 1, Math.round((crossings[k + 1] + 180) * 4));
          for (let col = from; col < to; col++) grid[row * GRID_W + col] ^= 1;
        }
      }
    }
  }
  const points = [];
  for (let row = 0; row < GRID_H; row++) {
    for (let col = 0; col < GRID_W; col++) {
      if (!grid[row * GRID_W + col]) continue;
      const lat = 90 - (row + 0.5) / 4;
      // La Antártida no está en el dibujo.
      if (lat > -58 && lat < 84) points.push((lat * Math.PI) / 180, (col + 0.5) / 4 - 180);
    }
  }
  return points;
}

async function loadMask() {
  const { data, info } = await sharp(IMAGE_PATH).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const w = Math.floor(width / STEP);
  const h = Math.floor(height / STEP);
  const mask = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let land = 0;
      for (let dy = 0; dy < STEP; dy++) {
        for (let dx = 0; dx < STEP; dx++) {
          if (data[((y * STEP + dy) * width + x * STEP + dx) * channels + 3] > 128) land++;
        }
      }
      mask[y * w + x] = land >= 6 ? 1 : 0;
    }
  }
  return { mask, w, h, width, height };
}

// Mismo modelo que project() en src/lib/atlas/project.ts, con la longitud ya en [-180, 180].
function forward(p, phi, lng) {
  const [ox, kx, oy, ky, a, b, c, d, e] = p;
  const phi2 = phi * phi;
  const q = lng / 180;
  return [
    ox + kx * lng * (1 + a * phi2 + b * phi2 * phi2 + e * q * q),
    oy - ky * phi * (1 + c * phi2 + d * phi2 * phi2),
  ];
}

function nelderMead(f, start, steps, iterations) {
  const n = start.length;
  let simplex = [start.slice()];
  for (let i = 0; i < n; i++) {
    const point = start.slice();
    point[i] += steps[i];
    simplex.push(point);
  }
  let values = simplex.map(f);
  for (let it = 0; it < iterations; it++) {
    const order = values.map((_, i) => i).sort((i, j) => values[j] - values[i]);
    simplex = order.map((i) => simplex[i]);
    values = order.map((i) => values[i]);
    const center = new Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) center[j] += simplex[i][j] / n;
    const worst = simplex[n];
    const reflected = center.map((c, j) => c + (c - worst[j]));
    const reflectedValue = f(reflected);
    if (reflectedValue > values[0]) {
      const expanded = center.map((c, j) => c + 2 * (c - worst[j]));
      const expandedValue = f(expanded);
      simplex[n] = expandedValue > reflectedValue ? expanded : reflected;
      values[n] = Math.max(expandedValue, reflectedValue);
    } else if (reflectedValue > values[n - 1]) {
      simplex[n] = reflected;
      values[n] = reflectedValue;
    } else {
      const contracted = center.map((c, j) => c + 0.5 * (worst[j] - c));
      const contractedValue = f(contracted);
      if (contractedValue > values[n]) {
        simplex[n] = contracted;
        values[n] = contractedValue;
      } else {
        for (let i = 1; i <= n; i++) {
          simplex[i] = simplex[i].map((v, j) => simplex[0][j] + 0.5 * (v - simplex[0][j]));
          values[i] = f(simplex[i]);
        }
      }
    }
  }
  const best = values.indexOf(Math.max(...values));
  return { params: simplex[best], score: values[best] };
}

const points = rasterizeLand(await loadLandGeoJson());
const { mask, w, h, width, height } = await loadMask();
const predicted = new Uint8Array(w * h);

// Coincidencia de tierra: intersección entre unión, de 0 a 1.
function score(params) {
  if (params[1] < 1 || params[3] < 20) return -1;
  predicted.fill(0);
  for (let i = 0; i < points.length; i += 2) {
    const [x, y] = forward(params, points[i], points[i + 1]);
    const cx = Math.floor(x / STEP);
    const cy = Math.floor(y / STEP);
    if (cx >= 0 && cx < w && cy >= 0 && cy < h) predicted[cy * w + cx] = 1;
  }
  let both = 0;
  let either = 0;
  for (let i = 0; i < w * h; i++) {
    if (predicted[i] || mask[i]) {
      either++;
      if (predicted[i] && mask[i]) both++;
    }
  }
  return both / either;
}

// ox, kx, oy, ky, a, b, c, d, e. Parte de un mapa de mundo completo centrado.
const start = [width * 0.45, (width * 0.97) / 360, height * 0.61, 300, -0.05, -0.03, 0.07, 0.01, -0.1];
const steps = [8, 0.1, 8, 10, 0.03, 0.02, 0.03, 0.02, 0.06];

let best = null;
let current = start;
for (let round = 0; round < 4; round++) {
  const result = nelderMead(score, current, steps, 300);
  current = result.params;
  if (!best || result.score > best.score) best = result;
  console.log(`vuelta ${round + 1}: coincidencia ${result.score.toFixed(4)}`);
}

const [ox, kx, oy, ky, a, b, c, d, e] = best.params.map((v) => Number(v.toFixed(4)));
console.log(`
export const ATLAS_MAP_CONFIG: FittedMapConfig = {
  projection: "fitted",
  image: { width: ${width}, height: ${height} },
  origin: { x: ${ox}, y: ${oy} },
  scale: { x: ${kx}, y: ${ky} },
  curve: { a: ${a}, b: ${b}, e: ${e}, c: ${c}, d: ${d} },
};
coincidencia de tierra: ${best.score.toFixed(4)}`);
