import { describe, expect, it } from "vitest";
import { buildPagination, type PaginationItem } from "./pagination";

function shape(items: PaginationItem[]): (number | "gap")[] {
  return items.map((item) => (item.type === "gap" ? "gap" : item.page));
}

describe("buildPagination", () => {
  it("con una sola página no hay items ni anterior ni siguiente", () => {
    const pagination = buildPagination(undefined, 1, 1);
    expect(pagination.items).toEqual([]);
    expect(pagination.previousHref).toBeNull();
    expect(pagination.nextHref).toBeNull();
  });

  it("la primera página no tiene anterior y la última no tiene siguiente", () => {
    expect(buildPagination(undefined, 1, 3).previousHref).toBeNull();
    expect(buildPagination(undefined, 1, 3).nextHref).toBe("/perspectives?page=2");
    expect(buildPagination(undefined, 3, 3).nextHref).toBeNull();
    expect(buildPagination(undefined, 3, 3).previousHref).toBe("/perspectives?page=2");
  });

  it("la página 1 apunta a la ruta limpia", () => {
    expect(buildPagination(undefined, 2, 3).previousHref).toBe("/perspectives");
  });

  it("20 páginas estando en la 10 colapsa con dos saltos", () => {
    expect(shape(buildPagination(undefined, 10, 20).items)).toEqual([1, "gap", 9, 10, 11, "gap", 20]);
  });

  it("no usa un salto para una sola página omitida", () => {
    expect(shape(buildPagination(undefined, 1, 4).items)).toEqual([1, 2, 3, 4]);
    expect(shape(buildPagination(undefined, 4, 7).items)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("marca solo la página actual", () => {
    const current = buildPagination(undefined, 2, 5).items.filter((item) => item.type === "page" && item.current);
    expect(current).toHaveLength(1);
    expect(current[0]).toMatchObject({ page: 2 });
  });

  it("conserva la categoría en todos los enlaces", () => {
    const pagination = buildPagination("branding", 2, 5);
    const hrefs = [
      pagination.previousHref,
      pagination.nextHref,
      ...pagination.items.map((item) => (item.type === "page" ? item.href : null)),
    ].filter((href): href is string => href !== null);
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toContain("category=branding");
  });

  it("acota una página fuera de rango", () => {
    expect(buildPagination(undefined, 99, 3).page).toBe(3);
    expect(buildPagination(undefined, 0, 3).page).toBe(1);
    expect(buildPagination(undefined, 2, 0).totalPages).toBe(1);
  });

  it("ningún enlace de anterior o siguiente apunta a la página actual", () => {
    const pagination = buildPagination(undefined, 2, 5);
    const currentItem = pagination.items.find((item) => item.type === "page" && item.current);
    expect(currentItem && currentItem.type === "page" ? currentItem.href : "").not.toBe(pagination.previousHref);
    expect(currentItem && currentItem.type === "page" ? currentItem.href : "").not.toBe(pagination.nextHref);
  });
});
