import type { Category } from "@/lib/constants";
import { perspectivesHref } from "./filter-links";

/** Páginas vecinas que se muestran a cada lado de la actual. */
export const PAGINATION_SIBLINGS = 1;

export type PaginationItem =
  | { type: "page"; page: number; href: string; current: boolean }
  | { type: "gap" };

export interface PaginationLinks {
  page: number;
  totalPages: number;
  previousHref: string | null;
  nextHref: string | null;
  /** Vacío cuando hay una sola página: no se pinta paginación. */
  items: PaginationItem[];
}

/** Páginas visibles: primera, última, la actual y sus vecinas. Lo demás se colapsa. */
function visiblePages(page: number, totalPages: number): number[] {
  const wanted = new Set([1, totalPages]);
  for (let offset = -PAGINATION_SIBLINGS; offset <= PAGINATION_SIBLINGS; offset += 1) {
    const candidate = page + offset;
    if (candidate >= 1 && candidate <= totalPages) wanted.add(candidate);
  }
  return [...wanted].sort((a, b) => a - b);
}

export function buildPagination(category: Category | undefined, page: number, totalPages: number): PaginationLinks {
  const total = Math.max(1, Math.floor(totalPages));
  const current = Math.min(Math.max(1, Math.floor(page)), total);
  const hrefFor = (target: number) => perspectivesHref({ ...(category ? { category } : {}), page: target });

  const items: PaginationItem[] = [];
  if (total > 1) {
    let previous = 0;
    for (const target of visiblePages(current, total)) {
      // Un salto de una sola página se muestra como número: un "..." no ahorra espacio.
      if (target - previous === 2) {
        items.push({ type: "page", page: previous + 1, href: hrefFor(previous + 1), current: false });
      } else if (target - previous > 2) {
        items.push({ type: "gap" });
      }
      items.push({ type: "page", page: target, href: hrefFor(target), current: target === current });
      previous = target;
    }
  }

  return {
    page: current,
    totalPages: total,
    previousHref: current > 1 ? hrefFor(current - 1) : null,
    nextHref: current < total ? hrefFor(current + 1) : null,
    items,
  };
}
