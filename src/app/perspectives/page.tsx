import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import type { Category } from "@/lib/constants";
import { uiText } from "@/content/ui-text";
import { listArticles } from "@/lib/data/articles";
import { parsePerspectivesFilters, toSearchParams } from "@/lib/filters";

export const metadata: Metadata = { title: uiText.perspectives.title };

function pageHref(category: Category | undefined, page: number) {
  const query = toSearchParams({ category, page }).toString();
  return query ? `/perspectives?${query}` : "/perspectives";
}

// Temporal: lista simple de títulos paginada. El diseño es de la Fase 1.
async function ArticleList({ searchParams }: { searchParams: PageProps<"/perspectives">["searchParams"] }) {
  const filters = parsePerspectivesFilters(await searchParams);
  const result = await listArticles(filters);
  if (result.items.length === 0) return <p className="text-muted">{uiText.perspectives.empty}</p>;
  return (
    <>
      <ul>
        {result.items.map((article) => (
          <li key={article.id}>
            <Link href={`/perspectives/${article.slug}`}>{article.title}</Link>
          </li>
        ))}
      </ul>
      <nav aria-label={uiText.perspectives.pagination} className="flex gap-4">
        {result.page > 1 && (
          <Link href={pageHref(filters.category, result.page - 1)}>{uiText.perspectives.previous}</Link>
        )}
        <span>
          {uiText.perspectives.page} {result.page} {uiText.perspectives.of} {result.totalPages}
        </span>
        {result.page < result.totalPages && (
          <Link href={pageHref(filters.category, result.page + 1)}>{uiText.perspectives.next}</Link>
        )}
      </nav>
    </>
  );
}

export default function PerspectivesPage({ searchParams }: PageProps<"/perspectives">) {
  return (
    <main className="p-4">
      <h1 className="font-display text-2xl">{uiText.perspectives.title}</h1>
      <Suspense>
        <ArticleList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
