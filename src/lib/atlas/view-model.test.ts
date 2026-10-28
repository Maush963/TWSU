import { describe, expect, it } from "vitest";
import type { Continent } from "@/lib/constants";
import type { AtlasPinData } from "@/lib/sanity/types";
import { buildAtlasView } from "./view-model";

function pin(slug: string, continent: Continent, x: number, y: number, title = slug): AtlasPinData {
  return {
    id: `id-${slug}`,
    slug,
    title,
    excerpt: "",
    placeName: "Lugar",
    continent,
    categories: ["branding"],
    lat: 0,
    lng: 0,
    x,
    y,
  };
}

const PINS = [
  pin("c", "asia", 80, 40),
  pin("a", "europa", 50, 30),
  pin("b", "europa", 50, 30),
  pin("d", "america", 20, 40),
];

describe("buildAtlasView", () => {
  it("byRegion respeta el orden de CONTINENTS y omite los continentes vacíos", () => {
    const view = buildAtlasView(PINS, {}, [2026]);
    expect(view.byRegion.map((group) => group.continent)).toEqual(["america", "europa", "asia"]);
  });

  it("ordena por título dentro de cada región", () => {
    const view = buildAtlasView(
      [pin("z", "europa", 10, 10, "Zeta"), pin("y", "europa", 90, 90, "Álamo")],
      {},
      [2026],
    );
    expect(view.byRegion[0]?.pins.map((p) => p.title)).toEqual(["Álamo", "Zeta"]);
  });

  it("isEmpty es true sin puntos", () => {
    const view = buildAtlasView([], { region: "oceania" }, [2026]);
    expect(view.isEmpty).toBe(true);
    expect(view.positioned).toEqual([]);
    expect(view.byRegion).toEqual([]);
  });

  it("isEmpty es false con puntos", () => {
    expect(buildAtlasView(PINS, {}, [2026]).isEmpty).toBe(false);
  });

  it("positioned trae todos los puntos, con encimados separados", () => {
    const view = buildAtlasView(PINS, {}, [2026]);
    expect(view.positioned).toHaveLength(4);
    const a = view.positioned.find((p) => p.slug === "a");
    const b = view.positioned.find((p) => p.slug === "b");
    expect(a && b && (a.displayX !== b.displayX || a.displayY !== b.displayY)).toBe(true);
  });

  it("positioned sigue el orden de las regiones", () => {
    const view = buildAtlasView(PINS, {}, [2026]);
    expect(view.positioned.map((p) => p.continent)).toEqual(["america", "europa", "europa", "asia"]);
  });

  it("el resultado es el mismo con los puntos en otro orden", () => {
    const forward = buildAtlasView(PINS, {}, [2026]);
    const backward = buildAtlasView([...PINS].reverse(), {}, [2026]);
    expect(backward.positioned).toEqual(forward.positioned);
    expect(backward.byRegion).toEqual(forward.byRegion);
  });

  it("cuenta las llaves y arma los enlaces de filtros", () => {
    const view = buildAtlasView(PINS, { category: "branding" }, [2026, 2025]);
    expect(view.counts.branding).toBe(4);
    expect(view.links.categories.find((link) => link.value === "branding")?.active).toBe(true);
    expect(view.links.years).toHaveLength(2);
  });
});
