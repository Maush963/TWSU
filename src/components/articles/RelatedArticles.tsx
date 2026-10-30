import { ArticleCard } from "@/components/articles/ArticleCard";
import { uiText } from "@/content/ui-text";
import type { ArticleSummary } from "@/lib/sanity/types";

// Sin lecturas relacionadas no se pinta nada.
export function RelatedArticles({ articles }: { articles: ArticleSummary[] }) {
  if (articles.length === 0) return null;
  return (
    <aside aria-label={uiText.article.related} className="flex flex-col gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} sizes="(min-width: 64rem) 20vw, 100vw" />
      ))}
    </aside>
  );
}
