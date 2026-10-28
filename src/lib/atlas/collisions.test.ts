import { describe, expect, it } from "vitest";
import type { AtlasPinData } from "@/lib/sanity/types";
import { DEFAULT_SPREAD_OPTIONS, spreadPins } from "./collisions";

function pin(slug: string, x: number, y: number): AtlasPinData {
  return {
    id: `id-${slug}`,
    slug,
    title: slug,
    excerpt: "",
    placeName: "Lugar",
    continent: "europa",
    categories: ["branding"],
    lat: 0,
    lng: 0,
    x,
    y,
  };
}

const { radius } = DEFAULT_SPREAD_OPTIONS;

function byId(pins: ReturnType<typeof spreadPins>) {
  return Object.fromEntries(pins.map((p) => [p.id, [p.displayX, p.displayY]]));
}

describe("spreadPins", () => {
  it("no mueve un punto aislado", () => {
    const [result] = spreadPins([pin("a", 40, 30)]);
    expect(result).toMatchObject({ displayX: 40, displayY: 30, x: 40, y: 30 });
  });

  it("no mueve puntos lejanos entre sí", () => {
    const result = spreadPins([pin("a", 10, 10), pin("b", 60, 60)]);
    expect(result.map((p) => [p.displayX, p.displayY])).toEqual([
      [10, 10],
      [60, 60],
    ]);
  });

  it("separa dos puntos del mismo lugar a la misma distancia del centro", () => {
    const [a, b] = spreadPins([pin("a", 50, 50), pin("b", 50, 50)]);
    if (!a || !b) throw new Error("faltan puntos");
    expect(Math.hypot(a.displayX - 50, a.displayY - 50)).toBeCloseTo(radius);
    expect(Math.hypot(b.displayX - 50, b.displayY - 50)).toBeCloseTo(radius);
    expect(a.displayX !== b.displayX || a.displayY !== b.displayY).toBe(true);
  });

  it("agrupa también puntos cercanos pero no idénticos", () => {
    const result = spreadPins([pin("a", 50, 50), pin("b", 50.5, 50)]);
    const distance = Math.hypot(
      (result[0]?.displayX ?? 0) - (result[1]?.displayX ?? 0),
      (result[0]?.displayY ?? 0) - (result[1]?.displayY ?? 0),
    );
    expect(distance).toBeGreaterThan(1);
  });

  it("un grupo de 5 queda con 5 posiciones distintas", () => {
    const pins = ["a", "b", "c", "d", "e"].map((slug) => pin(slug, 50, 50));
    const keys = new Set(spreadPins(pins).map((p) => `${p.displayX.toFixed(4)},${p.displayY.toFixed(4)}`));
    expect(keys.size).toBe(5);
  });

  it("el resultado no cambia si se invierte el orden de entrada", () => {
    const pins = [pin("a", 50, 50), pin("b", 50, 50), pin("c", 50.4, 50.2), pin("d", 10, 10)];
    expect(byId(spreadPins([...pins].reverse()))).toEqual(byId(spreadPins(pins)));
  });

  it("no mueve x e y originales", () => {
    const result = spreadPins([pin("a", 50, 50), pin("b", 50, 50)]);
    expect(result.every((p) => p.x === 50 && p.y === 50)).toBe(true);
  });

  it("mantiene el grupo dentro de 0 a 100 en una esquina", () => {
    const pins = ["a", "b", "c"].map((slug) => pin(slug, 0, 0));
    for (const p of spreadPins(pins)) {
      expect(p.displayX).toBeGreaterThanOrEqual(0);
      expect(p.displayX).toBeLessThanOrEqual(100);
      expect(p.displayY).toBeGreaterThanOrEqual(0);
      expect(p.displayY).toBeLessThanOrEqual(100);
    }
    const far = spreadPins(["a", "b"].map((slug) => pin(slug, 100, 100)));
    for (const p of far) {
      expect(p.displayX).toBeLessThanOrEqual(100);
      expect(p.displayY).toBeLessThanOrEqual(100);
    }
  });

  it("con aspectRatio 2 el círculo mantiene la misma distancia visual", () => {
    const options = { ...DEFAULT_SPREAD_OPTIONS, aspectRatio: 2 };
    const [a] = spreadPins([pin("a", 50, 50), pin("b", 50, 50)], options);
    if (!a) throw new Error("falta el punto");
    // En unidades del ancho, la distancia al centro sigue siendo el radio.
    expect(Math.hypot(a.displayX - 50, (a.displayY - 50) / 2)).toBeCloseTo(radius);
  });

  it("devuelve una lista vacía sin puntos", () => {
    expect(spreadPins([])).toEqual([]);
  });
});
