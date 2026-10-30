import Image from "next/image";
import { uiText } from "@/content/ui-text";
import { formatArticleDate } from "@/lib/articles/format";
import { urlFor } from "@/lib/sanity/image";
import type { ArticleSummary } from "@/lib/sanity/types";

export function ArticleHeader({ article }: { article: ArticleSummary }) {
  const date = formatArticleDate(article.publishedAt, uiText.meta.locale);
  return (
    <header className="flex flex-col gap-4">
      <p className="font-body text-xs uppercase tracking-caps">
        {uiText.article.author}
        {date && ` . ${date}`}
      </p>
      <h1 className="font-display text-2xl uppercase leading-none text-accent lg:text-3xl">{article.title}</h1>
      <Image
        src={urlFor(article.cover).width(2000).height(556).fit("crop").url()}
        alt={article.cover.alt}
        width={2000}
        height={556}
        sizes="(min-width: 64rem) 75vw, 100vw"
        priority
        className="article-cover"
      />
    </header>
  );
}
