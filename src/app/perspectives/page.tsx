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

  const selectProps = {
    action: PERSPECTIVES_PATH,
    label: uiText.perspectives.exploreBy,
    allLabel: uiText.perspectives.allTopics,
    applyLabel: uiText.perspectives.applyFilter,
    options: links.categories.map(({ value, title, href }) => ({ value, title, href })),
    allHref: links.allHref,
    selected: filters.category,
    hiddenFields: {},
  };

  return (
    <>
      {/* Título y selector de móvil; en escritorio el título solo queda para lectores de pantalla. */}
      <div className="flex items-center justify-between gap-4 bg-surface p-4 lg:contents">
        <h1 className="border-l-2 border-gold pl-4 font-display text-2xl uppercase text-accent lg:sr-only">
          {uiText.perspectives.title}
        </h1>
        <CategorySelect {...selectProps} id="perspectives-category-mobile" stacked className="lg:hidden" />
      </div>
      <div className="panel-layout perspectives-layout">
        <section className="panel-scroll border-gold p-4 max-lg:border-b lg:border-r lg:px-8">
          {featured && <FeaturedArticle article={featured} />}
        </section>
        <section className="panel-scroll p-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 max-lg:hidden">
            <h2 className="font-ui text-xs uppercase tracking-caps-wide">{uiText.perspectives.ideas}</h2>
            <CategorySelect {...selectProps} id="perspectives-category" />
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
            <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {items.map((article) => (
                <li key={article.id} className="flex flex-col *:flex-1">
                  <ArticleCard article={article} sizes="(min-width: 64rem) 22vw, 50vw" />
                </li>
              ))}
            </ul>
          )}
          <Pagination pagination={pagination} />
        </section>
      </div>
    </>
  );
}

export default function PerspectivesPage({ searchParams }: PageProps<"/perspectives">) {
  return (
    <main lang={uiText.meta.locale} className="panel-page flex min-h-0 flex-1 flex-col">
      <Suspense>
        <PerspectivesContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
