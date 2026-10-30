import { ArticleCard } from "@/components/articles/ArticleCard";
import { uiText } from "@/content/ui-text";
import type { ArticleSummary } from "@/lib/sanity/types";

/** Cuántas lecturas relacionadas caben en la rejilla de 2 columnas del móvil. */
const MOBILE_RELATED_LIMIT = 2;

// Sin lecturas relacionadas no se pinta nada.
export function RelatedArticles({ articles }: { articles: ArticleSummary[] }) {
  if (articles.length === 0) return null;
  return (
    <aside aria-labelledby="related-heading">
      <h2 id="related-heading" className="pb-4 font-ui text-xs uppercase tracking-caps-wide lg:sr-only">
        {uiText.article.related}
      </h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-6">
        {articles.map((article, index) => (
          // En móvil la rejilla es de 2 columnas y el diseño muestra solo 2 lecturas.
          <div key={article.id} className={index >= MOBILE_RELATED_LIMIT ? "max-lg:hidden" : ""}>
            <ArticleCard article={article} sizes="(min-width: 64rem) 20vw, 50vw" />
          </div>
        ))}
      </div>
    </aside>
  );
}
