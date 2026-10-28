// Calibra la posición del mapa del atlas contra los contornos reales de los continentes.
//
// Uso: npm run calibrate:atlas
//
// Descarga Natural Earth 110m (dominio público) y calibra en dos pasos:
//   1. Un modelo paramétrico suave (como una proyección) que se acerca a la tierra del dibujo.
//   2. Una malla de desplazamientos que corrige lo que ese modelo no alcanza. Empuja cada costa
//      real hacia la costa más cercana del PNG, de lo grueso a lo fino y con suavidad.
// Escribe src/lib/atlas/map-calibration.ts. Si cambia el PNG, hay que correrlo de nuevo.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const LAND_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson";
const IMAGE_PATH = "public/atlas/mapa.png";
const OUTPUT_PATH = "src/lib/atlas/map-calibration.ts";
const CACHE_PATH = join(tmpdir(), "ne_110m_land.geojson");
const D2R = Math.PI / 180;
const STEP = 4; // el PNG se reduce 4 veces para el paso 1
const GRID_W = 1440; // cuadrícula de tierra, grados * 4
const GRID_H = 720;
const MIN_ISLAND_PIXELS = 120; // las motas más pequeñas se ignoran al buscar costas
const MAX_DISTANCE = 45; // una costa a más de esto del dibujo no cuenta (islas que no están)
const WARP_LEVELS = [
  // columnas, filas, iteraciones, suavidad
  [4, 3, 300, 0],
  [8, 5, 300, 0.5],
  [16, 9, 400, 1],
];

async function loadLandGeoJson() {
  if (!existsSync(CACHE_PATH)) {
    const response = await fetch(LAND_URL);
    if (!response.ok) throw new Error(`No se pudo descargar ${LAND_URL}: ${response.status}`);
    writeFileSync(CACHE_PATH, await response.text());
  }
  return JSON.parse(readFileSync(CACHE_PATH, "utf8"));
}

function polygonsOf(geojson) {
  return geojson.features.flatMap(({ geometry }) =>
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates,
  );
}

// Tierra en una cuadrícula equirectangular de 0.25 grados, con la regla par-impar por polígono.
function landPoints(geojson) {
  const grid = new Uint8Array(GRID_W * GRID_H);
  for (const polygon of polygonsOf(geojson)) {
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
  const points = [];
  for (let row = 0; row < GRID_H; row++) {
    for (let col = 0; col < GRID_W; col++) {
      if (!grid[row * GRID_W + col]) continue;
      const lat = 90 - (row + 0.5) / 4;
      // La Antártida no está en el dibujo.
      if (lat > -58 && lat < 84) points.push(lat * D2R, (col + 0.5) / 4 - 180);
    }
  }
  return points;
}

// Puntos de la costa real, cada 0.4 grados.
function coastPoints(geojson) {
  const points = [];
  for (const polygon of polygonsOf(geojson)) {
    for (const ring of polygon) {
      for (let i = 0; i < ring.length - 1; i++) {
        const [x1, y1] = ring[i];
        const [x2, y2] = ring[i + 1];
        const parts = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 0.4));
        for (let k = 0; k < parts; k++) {
          const lat = y1 + ((y2 - y1) * k) / parts;
          if (lat > -58 && lat < 84) points.push([lat, x1 + ((x2 - x1) * k) / parts]);
        }
      }
    }
  }
  return points;
}

async function loadImage() {
  const { data, info } = await sharp(IMAGE_PATH).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const land = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) land[i] = data[i * channels + 3] > 128 ? 1 : 0;

  // Reducida, para el paso 1.
  const w = Math.floor(width / STEP);
  const h = Math.floor(height / STEP);
  const small = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let count = 0;
      for (let dy = 0; dy < STEP; dy++) {
        for (let dx = 0; dx < STEP; dx++) count += land[(y * STEP + dy) * width + x * STEP + dx];
      }
      small[y * w + x] = count >= 6 ? 1 : 0;
    }
  }
  return { land, width, height, small, w, h };
}

// Paso 1: modelo paramétrico -----------------------------------------------------------------

// ox, kx, oy, ky, a, b, c, d, e. Misma fórmula que project() en src/lib/atlas/project.ts.
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

function fitParametric(points, image) {
  const { small, w, h } = image;
  const predicted = new Uint8Array(w * h);

  // Coincidencia de tierra: intersección entre unión, de 0 a 1.
  const score = (params) => {
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
      if (predicted[i] || small[i]) {
        either++;
        if (predicted[i] && small[i]) both++;
      }
    }
    return both / either;
  };

  // Parte de un ajuste ya conocido; la búsqueda cae en máximos locales si parte de muy lejos.
  const start = [757.8593, 4.5969, 575.3455, 305.3594, -0.0899, -0.017, 0.1276, -0.0172, 0.0832];
  const steps = [8, 0.1, 8, 10, 0.03, 0.02, 0.03, 0.02, 0.06];
  let best = null;
  let current = start;
  for (let round = 0; round < 2; round++) {
    const result = nelderMead(score, current, steps, 200);
    current = result.params;
    if (!best || result.score > best.score) best = result;
    console.log(`paso 1, vuelta ${round + 1}: coincidencia de tierra ${result.score.toFixed(4)}`);
  }
  return best.params;
}

// Paso 2: malla de desplazamientos -------------------------------------------------------------

// Distancia de cada píxel a la costa del dibujo (transformada de distancia en dos pasadas).
function coastDistance({ land, width, height }) {
  // Se descartan las motas pequeñas: son islotes y ruido, no costas que valga la pena seguir.
  const label = new Int32Array(width * height);
  const keep = new Uint8Array(width * height);
  for (let start = 0; start < width * height; start++) {
    if (!land[start] || label[start]) continue;
    const members = [];
    const stack = [start];
    label[start] = 1;
    while (stack.length) {
      const p = stack.pop();
      members.push(p);
      const x = p % width;
      for (const q of [x > 0 ? p - 1 : -1, x < width - 1 ? p + 1 : -1, p - width, p + width]) {
        if (q >= 0 && q < width * height && land[q] && !label[q]) {
          label[q] = 1;
          stack.push(q);
        }
      }
    }
    if (members.length >= MIN_ISLAND_PIXELS) for (const p of members) keep[p] = 1;
  }

  const dist = new Float32Array(width * height).fill(1e9);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const edge =
        x === 0 || y === 0 || x === width - 1 || y === height - 1 ||
        !keep[i - 1] || !keep[i + 1] || !keep[i - width] || !keep[i + width];
      if (keep[i] && edge) dist[i] = 0;
    }
  }
  const diagonal = Math.SQRT2;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      let v = dist[i];
      if (x > 0) v = Math.min(v, dist[i - 1] + 1);
      if (y > 0) {
        v = Math.min(v, dist[i - width] + 1);
        if (x > 0) v = Math.min(v, dist[i - width - 1] + diagonal);
        if (x < width - 1) v = Math.min(v, dist[i - width + 1] + diagonal);
      }
      dist[i] = v;
    }
  }
  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const i = y * width + x;
      let v = dist[i];
      if (x < width - 1) v = Math.min(v, dist[i + 1] + 1);
      if (y < height - 1) {
        v = Math.min(v, dist[i + width] + 1);
        if (x < width - 1) v = Math.min(v, dist[i + width + 1] + diagonal);
        if (x > 0) v = Math.min(v, dist[i + width - 1] + diagonal);
      }
      dist[i] = v;
    }
  }
  return dist;
}

// Desplazamiento bilinear de la malla en un píxel. Devuelve dx, dy, los nodos y sus pesos.
function sampleWarp(warp, width, height, x, y) {
  const { cols, rows, dx, dy } = warp;
  const gx = Math.min(cols - 1e-6, Math.max(0, (x / width) * cols));
  const gy = Math.min(rows - 1e-6, Math.max(0, (y / height) * rows));
  const i0 = Math.floor(gx);
  const j0 = Math.floor(gy);
  const fx = gx - i0;
  const fy = gy - j0;
  const stride = cols + 1;
  const nodes = [j0 * stride + i0, j0 * stride + i0 + 1, (j0 + 1) * stride + i0, (j0 + 1) * stride + i0 + 1];
  const weights = [(1 - fx) * (1 - fy), fx * (1 - fy), (1 - fx) * fy, fx * fy];
  let sx = 0;
  let sy = 0;
  for (let k = 0; k < 4; k++) {
    sx += weights[k] * dx[nodes[k]];
    sy += weights[k] * dy[nodes[k]];
  }
  return { dx: sx, dy: sy, nodes, weights };
}

function fitWarp(coast, params, image) {
  const { width, height } = image;
  const dist = coastDistance(image);
  const sample = (x, y) => {
    const cx = Math.min(width - 1.001, Math.max(0, x));
    const cy = Math.min(height - 1.001, Math.max(0, y));
    const x0 = Math.floor(cx);
    const y0 = Math.floor(cy);
    const fx = cx - x0;
    const fy = cy - y0;
    return (
      dist[y0 * width + x0] * (1 - fx) * (1 - fy) +
      dist[y0 * width + x0 + 1] * fx * (1 - fy) +
      dist[(y0 + 1) * width + x0] * (1 - fx) * fy +
      dist[(y0 + 1) * width + x0 + 1] * fx * fy
    );
  };

  // Posición base de cada punto de costa; los que caen fuera de la imagen no cuentan.
  const base = [];
  for (const [lat, lng] of coast) {
    const wrapped = ((((lng + 180) % 360) + 360) % 360) - 180;
    const [x, y] = forward(params, lat * D2R, wrapped);
    if (x >= -10 && x <= width + 10 && y >= -10 && y <= height + 10) base.push([x, y]);
  }

  const stats = (warp) => {
    const ds = base.map(([x, y]) => {
      const s = sampleWarp(warp, width, height, x, y);
      return sample(x + s.dx, y + s.dy);
    });
    ds.sort((a, b) => a - b);
    const mean = ds.reduce((sum, v) => sum + v, 0) / ds.length;
    return `media ${mean.toFixed(1)} px, mediana ${ds[ds.length >> 1].toFixed(1)}, p90 ${ds[Math.floor(ds.length * 0.9)].toFixed(1)}`;
  };

  const resample = (warp, cols, rows) => {
    const next = { cols, rows, dx: new Float64Array((cols + 1) * (rows + 1)), dy: new Float64Array((cols + 1) * (rows + 1)) };
    for (let j = 0; j <= rows; j++) {
      for (let i = 0; i <= cols; i++) {
        const s = sampleWarp(warp, width, height, (i / cols) * width, (j / rows) * height);
        next.dx[j * (cols + 1) + i] = s.dx;
        next.dy[j * (cols + 1) + i] = s.dy;
      }
    }
    return next;
  };

  // Adam sobre los desplazamientos de los nodos.
  const optimise = (warp, iterations, smoothness) => {
    const { cols, rows, dx, dy } = warp;
    const stride = cols + 1;
    const count = stride * (rows + 1);
    const m1 = [new Float64Array(count), new Float64Array(count)];
    const m2 = [new Float64Array(count), new Float64Array(count)];
    const rate = 0.6;
    for (let it = 1; it <= iterations; it++) {
      const grad = [new Float64Array(count), new Float64Array(count)];
      for (const [x, y] of base) {
        const s = sampleWarp(warp, width, height, x, y);
        const qx = x + s.dx;
        const qy = y + s.dy;
        const d = sample(qx, qy);
        if (d > MAX_DISTANCE) continue;
        const gx = (sample(qx + 1, qy) - sample(qx - 1, qy)) / 2;
        const gy = (sample(qx, qy + 1) - sample(qx, qy - 1)) / 2;
        for (let k = 0; k < 4; k++) {
          grad[0][s.nodes[k]] += ((2 * d * gx * s.weights[k]) / base.length) * 1000;
          grad[1][s.nodes[k]] += ((2 * d * gy * s.weights[k]) / base.length) * 1000;
        }
      }
      // Suavidad: cada nodo tiende al promedio de sus vecinos.
      for (let j = 0; j <= rows; j++) {
        for (let i = 0; i <= cols; i++) {
          const id = j * stride + i;
          let sx = 0;
          let sy = 0;
          let n = 0;
          for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const ii = i + di;
            const jj = j + dj;
            if (ii < 0 || jj < 0 || ii > cols || jj > rows) continue;
            sx += dx[jj * stride + ii];
            sy += dy[jj * stride + ii];
            n++;
          }
          grad[0][id] += smoothness * (dx[id] - sx / n);
          grad[1][id] += smoothness * (dy[id] - sy / n);
        }
      }
      [dx, dy].forEach((target, axis) => {
        for (let id = 0; id < count; id++) {
          m1[axis][id] = 0.9 * m1[axis][id] + 0.1 * grad[axis][id];
          m2[axis][id] = 0.999 * m2[axis][id] + 0.001 * grad[axis][id] ** 2;
          target[id] -= (rate * (m1[axis][id] / (1 - 0.9 ** it))) / (Math.sqrt(m2[axis][id] / (1 - 0.999 ** it)) + 1e-8);
        }
      });
    }
  };

  let warp = { cols: 4, rows: 3, dx: new Float64Array(20), dy: new Float64Array(20) };
  console.log(`paso 2, sin malla: ${stats(warp)}`);
  for (const [cols, rows, iterations, smoothness] of WARP_LEVELS) {
    warp = resample(warp, cols, rows);
    optimise(warp, iterations, smoothness);
    console.log(`paso 2, malla ${cols}x${rows}: ${stats(warp)}`);
  }
  return warp;
}

// Salida ---------------------------------------------------------------------------------------

function formatRows(values, columns) {
  const rounded = Array.from(values, (v) => Number(v.toFixed(1)));
  const lines = [];
  for (let i = 0; i < rounded.length; i += columns) {
    lines.push("      " + rounded.slice(i, i + columns).map((v) => String(v)).join(", ") + ",");
  }
  return lines.join("\n");
}

const geojson = await loadLandGeoJson();
const image = await loadImage();
const params = fitParametric(landPoints(geojson), image);
const warp = fitWarp(coastPoints(geojson), params, image);

const [ox, kx, oy, ky, a, b, c, d, e] = params.map((v) => Number(v.toFixed(4)));
const columns = warp.cols + 1;
writeFileSync(
  OUTPUT_PATH,
  `// Generado por scripts/calibrate-atlas.mjs (npm run calibrate:atlas). No editar a mano.
import type { FittedMapConfig } from "@/lib/atlas/project";

export const ATLAS_CALIBRATION: Pick<FittedMapConfig, "origin" | "scale" | "curve" | "warp"> = {
  origin: { x: ${ox}, y: ${oy} },
  scale: { x: ${kx}, y: ${ky} },
  curve: { a: ${a}, b: ${b}, e: ${e}, c: ${c}, d: ${d} },
  // Desplazamiento en píxeles de la imagen, por nodo de una malla de ${warp.cols} por ${warp.rows} celdas.
  // Un nodo por columna y fila, de izquierda a derecha y de arriba abajo.
  warp: {
    cols: ${warp.cols},
    rows: ${warp.rows},
    dx: [
${formatRows(warp.dx, columns)}
    ],
    dy: [
${formatRows(warp.dy, columns)}
    ],
  },
};
`,
);
console.log(`Escrito ${OUTPUT_PATH}`);
