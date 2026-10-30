import type { ArticleFilterParams, ArticleSummary, Paginated } from "@/lib/sanity/types";
import { buildPerspectivesFilterLinks, type PerspectivesFilterLinks } from "./filter-links";
import { buildPagination, type PaginationLinks } from "./pagination";

export interface PerspectivesView<F extends ArticleSummary = ArticleSummary> {
  featured: F | null;
  items: ArticleSummary[];
  links: PerspectivesFilterLinks;
  pagination: PaginationLinks;
  /** Sin destacado visible y sin tarjetas. */
  isEmpty: boolean;
}

/**
 * Junta destacado, listado, filtros y paginación para que la página solo pinte.
 * `featured` ya es el de la categoría elegida (`getFeaturedArticle(filters.category)`) y se
 * muestra en todas las páginas. `result` viene sin él (`listArticles(filters, featured.id)`) y
 * con la página acotada a la última, así que la paginación usa `result.page` y no la pedida.
 */
export function buildPerspectivesView<F extends ArticleSummary>(
  featured: F | null,
  result: Paginated<ArticleSummary>,
  filters: ArticleFilterParams,
): PerspectivesView<F> {
  return {
    featured,
    items: result.items,
    links: buildPerspectivesFilterLinks(filters),
    pagination: buildPagination(filters.category, result.page, result.totalPages),
    isEmpty: featured === null && result.items.length === 0,
  };
}
