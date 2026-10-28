import type { AtlasPinData } from "@/lib/sanity/types";

export type PositionedPin = AtlasPinData & {
  /** Posición horizontal a dibujar, en porcentaje. */
  displayX: number;
  /** Posición vertical a dibujar, en porcentaje. */
  displayY: number;
};

export interface SpreadOptions {
  /** Distancia, medida en porcentaje del ancho, bajo la cual dos puntos se agrupan. */
  threshold: number;
  /** Radio del círculo en que se reparte un grupo, en porcentaje del ancho. */
  radius: number;
  /** Ancho entre alto de la imagen. Hace que el círculo sea redondo y no una elipse. */
  aspectRatio: number;
}

export const DEFAULT_SPREAD_OPTIONS: SpreadOptions = {
  threshold: 1.5,
  radius: 1.2,
  aspectRatio: 1,
};

function compareBySlug(a: AtlasPinData, b: AtlasPinData): number {
  if (a.slug !== b.slug) return a.slug < b.slug ? -1 : 1;
  if (a.id !== b.id) return a.id < b.id ? -1 : 1;
  return 0;
}

/** Une los puntos que se tocan entre sí, directa o encadenadamente. */
function groupByProximity(pins: AtlasPinData[], options: SpreadOptions): AtlasPinData[][] {
  const parent = pins.map((_, index) => index);
  const find = (index: number): number => {
    let root = index;
    while (parent[root] !== root) root = parent[root] ?? root;
    parent[index] = root;
    return root;
  };

  for (let i = 0; i < pins.length; i++) {
    for (let j = i + 1; j < pins.length; j++) {
      const a = pins[i];
      const b = pins[j];
      if (!a || !b) continue;
      const distance = Math.hypot(a.x - b.x, (a.y - b.y) / options.aspectRatio);
      if (distance < options.threshold) parent[find(j)] = find(i);
    }
  }

  const groups = new Map<number, AtlasPinData[]>();
  pins.forEach((pin, index) => {
    const root = find(index);
    groups.set(root, [...(groups.get(root) ?? []), pin]);
  });
  return [...groups.values()];
}

/** Desplaza el grupo completo hacia adentro si algún punto se sale de 0 a 100. */
function keepInside(points: { displayX: number; displayY: number }[]): void {
  const xs = points.map((point) => point.displayX);
  const ys = points.map((point) => point.displayY);
  const shiftX = Math.max(0, -Math.min(...xs)) - Math.max(0, Math.max(...xs) - 100);
  const shiftY = Math.max(0, -Math.min(...ys)) - Math.max(0, Math.max(...ys) - 100);
  for (const point of points) {
    point.displayX += shiftX;
    point.displayY += shiftY;
  }
}

/**
 * Separa los puntos encimados en un círculo alrededor del centro de su grupo.
 * Es determinista: el orden y el ángulo salen del `slug`, no del orden de entrada.
 * Devuelve los puntos ordenados por `slug`; `x` e `y` originales no se tocan.
 */
export function spreadPins(
  pins: AtlasPinData[],
  options: SpreadOptions = DEFAULT_SPREAD_OPTIONS,
): PositionedPin[] {
  const sorted = [...pins].sort(compareBySlug);
  const result: PositionedPin[] = [];

  for (const group of groupByProximity(sorted, options)) {
    if (group.length === 1) {
      const [pin] = group;
      if (pin) result.push({ ...pin, displayX: pin.x, displayY: pin.y });
      continue;
    }

    const centerX = group.reduce((sum, pin) => sum + pin.x, 0) / group.length;
    const centerY = group.reduce((sum, pin) => sum + pin.y, 0) / group.length;

    const positioned = group.map((pin, index) => {
      // Empieza siempre arriba y avanza en el sentido de las manecillas del reloj.
      const angle = -Math.PI / 2 + (2 * Math.PI * index) / group.length;
      return {
        ...pin,
        displayX: centerX + options.radius * Math.cos(angle),
        displayY: centerY + options.radius * Math.sin(angle) * options.aspectRatio,
      };
    });

    keepInside(positioned);
    result.push(...positioned);
  }

  return result.sort(compareBySlug);
}
