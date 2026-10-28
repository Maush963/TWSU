import { describe, expect, it } from "vitest";
import { buildAtlasFilterLinks, resolveAtlasYear } from "./filter-links";

const YEARS = [2026, 2025];

function find<T extends { value: unknown }>(links: T[], value: T["value"]): T {
  const link = links.find((item) => item.value === value);
  if (!link) throw new Error(`no existe la opción ${String(value)}`);
  return link;
}

describe("resolveAtlasYear", () => {
  it("usa el año pedido si tiene datos", () => {
    expect(resolveAtlasYear(2025, YEARS)).toBe(2025);
  });

  it("cae al más reciente si el año no tiene datos o no viene", () => {
    expect(resolveAtlasYear(2005, YEARS)).toBe(2026);
    expect(resolveAtlasYear(undefined, YEARS)).toBe(2026);
  });

  it("devuelve undefined si no hay años", () => {
    expect(resolveAtlasYear(2025, [])).toBeUndefined();
  });
});

describe("buildAtlasFilterLinks", () => {
  it("sin filtros, nada activo salvo el año por defecto", () => {
    const links = buildAtlasFilterLinks({}, YEARS);
    expect(links.categories.some((link) => link.active)).toBe(false);
    expect(links.regions.some((link) => link.active)).toBe(false);
    expect(find(links.years, 2026).active).toBe(true);
    expect(links.hasActiveFilters).toBe(false);
    expect(links.clearHref).toBe("/atlas");
  });

  it("elegir una categoría conserva región y año", () => {
    const links = buildAtlasFilterLinks({ region: "europa", year: 2025 }, YEARS);
    const url = new URL(find(links.categories, "branding").href, "http://x");
    expect(url.pathname).toBe("/atlas");
    expect(url.searchParams.get("category")).toBe("branding");
    expect(url.searchParams.get("region")).toBe("europa");
    expect(url.searchParams.get("year")).toBe("2025");
  });

  it("elegir la categoría activa genera un enlace que la quita", () => {
    const links = buildAtlasFilterLinks({ category: "branding", region: "europa" }, YEARS);
    const link = find(links.categories, "branding");
    expect(link.active).toBe(true);
    expect(link.href).toBe("/atlas?region=europa");
  });

  it("elegir la región activa genera un enlace que la quita", () => {
    const links = buildAtlasFilterLinks({ region: "asia" }, YEARS);
    expect(find(links.regions, "asia").href).toBe("/atlas");
  });

  it("el año por defecto no aparece en la URL", () => {
    const links = buildAtlasFilterLinks({ category: "branding", year: 2025 }, YEARS);
    expect(find(links.years, 2026).href).toBe("/atlas?category=branding");
    expect(find(links.years, 2025).href).toBe("/atlas?category=branding&year=2025");
  });

  it("un año sin datos se trata como el año por defecto", () => {
    const links = buildAtlasFilterLinks({ year: 2005, category: "branding" }, YEARS);
    expect(find(links.years, 2026).active).toBe(true);
    expect(find(links.categories, "campanas").href).toBe("/atlas?category=campanas");
    expect(links.hasActiveFilters).toBe(true);
  });

  it("un año distinto del por defecto cuenta como filtro activo", () => {
    expect(buildAtlasFilterLinks({ year: 2025 }, YEARS).hasActiveFilters).toBe(true);
  });

  it("sin años no hay opciones de año ni rompe", () => {
    const links = buildAtlasFilterLinks({ year: 2025 }, []);
    expect(links.years).toEqual([]);
    expect(find(links.categories, "branding").href).toBe("/atlas?category=branding");
    expect(links.hasActiveFilters).toBe(false);
  });

  it("incluye las 5 categorías y los 5 continentes con su título", () => {
    const links = buildAtlasFilterLinks({}, YEARS);
    expect(links.categories).toHaveLength(5);
    expect(links.regions).toHaveLength(5);
    expect(find(links.regions, "america").title).toBe("América");
  });
});
