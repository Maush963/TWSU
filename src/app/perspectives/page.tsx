import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { FeaturedArticle } from "@/components/articles/FeaturedArticle";
import { Pagination } from "@/components/articles/Pagination";
import { CategorySelect } from "@/components/ui/CategorySelect";
import { uiText } from "@/content/ui-text";
import { getFeaturedArticle, listArticles } from "@/lib/data/articles";
import { parsePerspectivesFilters } from "@/lib/filters";
import { PERSPECTIVES_PATH } from "@/lib/perspectives/filter-links";
import { buildPerspectivesView } from "@/lib/perspectives/view-model";

export const metadata: Metadata = { title: uiText.perspectives.title };

async function PerspectivesContent({ searchParams }: { searchParams: PageProps<"/perspectives">["searchParams"] }) {
  const filters = parsePerspectivesFilters(await searchParams);
  // Cada categoría tiene su destacado, que se pinta aparte y no se repite en el listado.
  const featured = await getFeaturedArticle(filters.category);
  const result = await listArticles(filters, featured?.id);
  const { links, items, pagination, isEmpty } = buildPerspectivesView(featured, result, filters);

  return (
    <div className="panel-layout perspectives-layout">
      <section className="panel-scroll border-gold p-4 lg:border-r lg:px-8">
        {featured && <FeaturedArticle article={featured} />}
      </section>
      <section className="panel-scroll p-4 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
          <h2 className="font-ui text-xs uppercase tracking-caps-wide">{uiText.perspectives.ideas}</h2>
          <CategorySelect
            action={PERSPECTIVES_PATH}
            id="perspectives-category"
            label={uiText.perspectives.exploreBy}
            allLabel={uiText.perspectives.allTopics}
            applyLabel={uiText.perspectives.applyFilter}
            options={links.categories.map(({ value, title, href }) => ({ value, title, href }))}
            allHref={links.allHref}
            selected={filters.category}
            hiddenFields={{}}
          />
        </div>
        {isEmpty ? (
          <p className="text-muted">
            {uiText.perspectives.empty}{" "}
            {links.hasActiveFilters && (
              <Link href={links.allHref} className="text-accent underline">
                {uiText.perspectives.clearFilters}
              </Link>
            )}
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((article) => (
              <li key={article.id} className="flex flex-col *:flex-1">
                <ArticleCard article={article} sizes="(min-width: 64rem) 22vw, (min-width: 40rem) 50vw, 100vw" />
              </li>
            ))}
          </ul>
        )}
        <Pagination pagination={pagination} />
      </section>
    </div>
  );
}

export default function PerspectivesPage({ searchParams }: PageProps<"/perspectives">) {
  return (
    <main className="panel-page flex min-h-0 flex-1 flex-col">
      <h1 className="sr-only">{uiText.perspectives.title}</h1>
      <Suspense>
        <PerspectivesContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
