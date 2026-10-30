import Link from "next/link";
import { uiText } from "@/content/ui-text";
import type { PaginationLinks } from "@/lib/perspectives/pagination";

// Con una sola página `items` viene vacío y no se pinta nada.
export function Pagination({ pagination }: { pagination: PaginationLinks }) {
  if (pagination.items.length === 0) return null;
  return (
    <nav aria-label={uiText.perspectives.pagination} className="flex items-center justify-center gap-4 pt-8 font-ui">
      {pagination.previousHref && (
        <Link href={pagination.previousHref} rel="prev" className="text-accent hover:underline">
          {uiText.perspectives.previous}
        </Link>
      )}
      <ul className="flex items-center gap-2">
        {pagination.items.map((item, index) =>
          item.type === "gap" ? (
            <li key={`gap-${index}`} aria-hidden>
              …
            </li>
          ) : (
            <li key={item.page}>
              <Link
                href={item.href}
                aria-current={item.current ? "page" : undefined}
                aria-label={`${uiText.perspectives.page} ${item.page}`}
                className={`px-2 ${item.current ? "border-b-2 border-gold text-accent" : "hover:text-accent"}`}
              >
                {item.page}
              </Link>
            </li>
          ),
        )}
      </ul>
      {pagination.nextHref && (
        <Link href={pagination.nextHref} rel="next" className="text-accent hover:underline">
          {uiText.perspectives.next}
        </Link>
      )}
    </nav>
  );
}
