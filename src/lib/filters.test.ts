import { describe, expect, it } from "vitest";
import { parseAtlasFilters, parsePerspectivesFilters, toSearchParams } from "@/lib/filters";

const NOW = 2026;

describe("parseAtlasFilters", () => {
  it("acepta valores válidos", () => {
    expect(parseAtlasFilters({ category: "branding", region: "europa", year: "2025" }, NOW)).toEqual({
      category: "branding",
      region: "europa",
      year: 2025,
    });
  });

  it("ignora valores inválidos sin lanzar errores", () => {
    expect(parseAtlasFilters({ category: "xxx", region: "marte", year: "abcd" }, NOW)).toEqual({});
    expect(parseAtlasFilters({ category: "Branding", region: "Europa" }, NOW)).toEqual({});
  });

  it("trata los vacíos y los ausentes igual", () => {
    expect(parseAtlasFilters({ category: "", region: "", year: "" }, NOW)).toEqual({});
    expect(parseAtlasFilters({}, NOW)).toEqual({});
    expect(parseAtlasFilters({ category: undefined }, NOW)).toEqual({});
  });

  it("usa el primero cuando el parámetro viene repetido", () => {
    expect(parseAtlasFilters({ category: ["branding", "campanas"] }, NOW)).toEqual({ category: "branding" });
    expect(parseAtlasFilters({ category: ["xxx", "branding"] }, NOW)).toEqual({});
  });

  it("limita el año a 2000 hasta el año actual más 1", () => {
    expect(parseAtlasFilters({ year: "2000" }, NOW)).toEqual({ year: 2000 });
    expect(parseAtlasFilters({ year: "2027" }, NOW)).toEqual({ year: 2027 });
    expect(parseAtlasFilters({ year: "1999" }, NOW)).toEqual({});
    expect(parseAtlasFilters({ year: "2028" }, NOW)).toEqual({});
  });

  it("exige un año entero de 4 dígitos", () => {
    for (const year of ["202", "20260", "2025.5", "-2025", "2e3", " 2025", "0x7e9"]) {
      expect(parseAtlasFilters({ year }, NOW)).toEqual({});
    }
  });

  it("no lee la página, que es solo de Perspectives", () => {
    expect(parseAtlasFilters({ page: "3" }, NOW)).toEqual({});
  });
});

describe("parsePerspectivesFilters", () => {
  it("la página vale 1 por defecto", () => {
    expect(parsePerspectivesFilters({})).toEqual({ page: 1 });
  });

  it("acepta categoría y página válidas", () => {
    expect(parsePerspectivesFilters({ category: "campanas", page: "2" })).toEqual({
      category: "campanas",
      page: 2,
    });
  });

  it("si la página viene mal, vale 1", () => {
    for (const page of ["0", "-1", "abc", "1.5", "", "99999999999999999999"]) {
      expect(parsePerspectivesFilters({ page })).toEqual({ page: 1 });
    }
  });

  it("ignora una categoría inválida y conserva la página", () => {
    expect(parsePerspectivesFilters({ category: "xxx", page: "3" })).toEqual({ page: 3 });
  });

  it("usa el primer valor repetido", () => {
    expect(parsePerspectivesFilters({ page: ["4", "2"] })).toEqual({ page: 4 });
  });

  it("no lee region ni year", () => {
    expect(parsePerspectivesFilters({ region: "europa", year: "2025" })).toEqual({ page: 1 });
  });
});

describe("toSearchParams", () => {
  it("omite vacíos y la página 1", () => {
    expect(toSearchParams({}).toString()).toBe("");
    expect(toSearchParams({ page: 1 }).toString()).toBe("");
  });

  it("escribe los valores presentes", () => {
    expect(toSearchParams({ category: "branding", region: "asia", year: 2025 }).toString()).toBe(
      "category=branding&region=asia&year=2025",
    );
    expect(toSearchParams({ category: "branding", page: 3 }).toString()).toBe("category=branding&page=3");
  });

  it("es el inverso de los parsers", () => {
    const atlas = { category: "storytelling", region: "africa", year: 2025 } as const;
    expect(parseAtlasFilters(Object.fromEntries(toSearchParams(atlas)), NOW)).toEqual(atlas);
    const perspectives = { category: "plataformas", page: 4 } as const;
    expect(parsePerspectivesFilters(Object.fromEntries(toSearchParams(perspectives)))).toEqual(perspectives);
  });
});
