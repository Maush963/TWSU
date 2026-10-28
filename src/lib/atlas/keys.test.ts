import { describe, expect, it } from "vitest";
import { CATEGORIES, type Category } from "@/lib/constants";
import type { AtlasPinData } from "@/lib/sanity/types";
import { countByCategory, getKeyStates } from "./keys";

function pin(slug: string, categories: Category[]): AtlasPinData {
  return {
    id: `id-${slug}`,
    slug,
    title: slug,
    excerpt: "",
    placeName: "Lugar",
    continent: "europa",
    categories,
    lat: 0,
    lng: 0,
    x: 0,
    y: 0,
  };
}

describe("getKeyStates", () => {
  it("sin categorías devuelve las 5 llaves apagadas", () => {
    const states = getKeyStates([]);
    expect(states).toHaveLength(5);
    expect(states.every((state) => !state.active)).toBe(true);
  });

  it("enciende solo las categorías dadas", () => {
    const active = getKeyStates(["branding", "campanas"]).filter((state) => state.active);
    expect(active.map((state) => state.category)).toEqual(["campanas", "branding"]);
  });

  it("mantiene el orden de CATEGORIES sin importar el orden de entrada", () => {
    const expected = CATEGORIES.map((category) => category.value);
    expect(getKeyStates(["social-media", "storytelling"]).map((state) => state.category)).toEqual(expected);
  });

  it("incluye el título de cada categoría", () => {
    expect(getKeyStates([]).map((state) => state.title)).toEqual(CATEGORIES.map((category) => category.title));
  });
});

describe("countByCategory", () => {
  it("devuelve ceros sin puntos", () => {
    expect(Object.values(countByCategory([]))).toEqual([0, 0, 0, 0, 0]);
  });

  it("un artículo con 2 categorías cuenta en las dos", () => {
    const counts = countByCategory([pin("a", ["branding", "campanas"]), pin("b", ["branding"])]);
    expect(counts.branding).toBe(2);
    expect(counts.campanas).toBe(1);
    expect(counts.storytelling).toBe(0);
  });

  it("no cuenta dos veces una categoría repetida en el mismo punto", () => {
    expect(countByCategory([pin("a", ["branding", "branding"])]).branding).toBe(1);
  });
});
