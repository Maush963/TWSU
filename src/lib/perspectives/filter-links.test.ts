import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/lib/constants";
import { buildPerspectivesFilterLinks, perspectivesHref } from "./filter-links";

describe("perspectivesHref", () => {
  it("sin filtros ni página 1 lleva a la ruta limpia", () => {
    expect(perspectivesHref({})).toBe("/perspectives");
    expect(perspectivesHref({ page: 1 })).toBe("/perspectives");
  });

  it("escribe categoría y página desde la 2", () => {
    expect(perspectivesHref({ category: "branding", page: 2 })).toBe("/perspectives?category=branding&page=2");
  });
});

describe("buildPerspectivesFilterLinks", () => {
  it("sin filtros, nada activo", () => {
    const links = buildPerspectivesFilterLinks({ page: 1 });
    expect(links.categories.some((link) => link.active)).toBe(false);
    expect(links.hasActiveFilters).toBe(false);
    expect(links.allHref).toBe("/perspectives");
  });

  it("siempre trae las 5 categorías en el orden de CATEGORIES", () => {
    const links = buildPerspectivesFilterLinks({ page: 1 });
    expect(links.categories.map((link) => link.value)).toEqual(CATEGORIES.map((category) => category.value));
  });

  it("elegir una categoría desde la página 3 vuelve a la página 1", () => {
    const links = buildPerspectivesFilterLinks({ page: 3 });
    const branding = links.categories.find((link) => link.value === "branding");
    expect(branding?.href).toBe("/perspectives?category=branding");
  });

  it("elegir la categoría activa la quita", () => {
    const links = buildPerspectivesFilterLinks({ category: "branding", page: 2 });
    const branding = links.categories.find((link) => link.value === "branding");
    expect(branding?.active).toBe(true);
    expect(branding?.href).toBe("/perspectives");
    expect(links.hasActiveFilters).toBe(true);
  });

  it("elegir otra categoría reemplaza la activa", () => {
    const links = buildPerspectivesFilterLinks({ category: "branding", page: 1 });
    const storytelling = links.categories.find((link) => link.value === "storytelling");
    expect(storytelling?.active).toBe(false);
    expect(storytelling?.href).toBe("/perspectives?category=storytelling");
  });
});
