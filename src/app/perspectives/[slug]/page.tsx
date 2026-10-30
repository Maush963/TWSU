import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/articles/ArticleBody";
import { ArticleHeader } from "@/components/articles/ArticleHeader";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
import { RELATED_ARTICLES_LIMIT } from "@/lib/constants";
import { buildArticleMetadata } from "@/lib/articles/metadata";
import { getArticleBySlug, getArticleSlugs, getRelatedArticles } from "@/lib/data/articles";
import { urlFor } from "@/lib/sanity/image";

// Con Cache Components, generateStaticParams no puede devolver una lista vacía. Si no hay
// artículos publicados se prerenderiza este slug, que no existe y termina en 404.
const EMPTY_FALLBACK_SLUG = "sin-articulos";

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return (slugs.length > 0 ? slugs : [EMPTY_FALLBACK_SLUG]).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/perspectives/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  return article ? buildArticleMetadata(article, urlFor(article.cover).width(1200).height(630).url()) : {};
}

export default async function ArticlePage({ params }: PageProps<"/perspectives/[slug]">) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  const related = await getRelatedArticles(article, RELATED_ARTICLES_LIMIT);

  return (
    <main className="panel-page flex min-h-0 flex-1 flex-col">
      <div className="panel-layout article-layout">
        <article className="panel-scroll flex flex-col gap-8 p-4 lg:px-8">
          <ArticleHeader article={article} />
          <ArticleBody body={article.body} />
        </article>
        <div className="panel-scroll border-gold p-4 lg:border-l lg:px-8">
          <RelatedArticles articles={related} />
        </div>
      </div>
    </main>
  );
}
