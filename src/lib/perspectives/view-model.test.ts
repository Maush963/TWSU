import { describe, expect, it } from "vitest";
import type { ArticleSummary, Paginated } from "@/lib/sanity/types";
import { FEATURED } from "./fixtures";
import { buildPerspectivesView } from "./view-model";

function card(id: string): ArticleSummary {
  return { ...FEATURED, id, slug: id, title: id };
}

function result(items: ArticleSummary[], page = 1, totalPages = 1): Paginated<ArticleSummary> {
  return { items, page, totalPages, total: items.length };
}

describe("buildPerspectivesView", () => {
  it("está vacío sin destacado ni tarjetas", () => {
    expect(buildPerspectivesView(null, result([]), { page: 1 }).isEmpty).toBe(true);
  });

  it("no está vacío si solo hay destacado", () => {
    const view = buildPerspectivesView(FEATURED, result([]), { page: 1 });
    expect(view.featured).toBe(FEATURED);
    expect(view.isEmpty).toBe(false);
  });

  it("no está vacío si solo hay tarjetas", () => {
    expect(buildPerspectivesView(null, result([card("b1")]), { page: 1 }).isEmpty).toBe(false);
  });

  it("el destacado se muestra también de la página 2 en adelante", () => {
    const view = buildPerspectivesView(FEATURED, result([card("b1")], 2, 3), { page: 2 });
    expect(view.featured).toBe(FEATURED);
  });

  it("la paginación usa la página que devolvió el listado, no la pedida", () => {
    const view = buildPerspectivesView(FEATURED, result([card("b1")], 3, 3), { page: 99 });
    expect(view.pagination.page).toBe(3);
    expect(view.pagination.nextHref).toBeNull();
  });

  it("conserva el orden de las tarjetas y arma los enlaces de filtro", () => {
    const view = buildPerspectivesView(null, result([card("b2"), card("b1")]), { category: "branding", page: 1 });
    expect(view.items.map((item) => item.id)).toEqual(["b2", "b1"]);
    expect(view.links.hasActiveFilters).toBe(true);
  });
});
