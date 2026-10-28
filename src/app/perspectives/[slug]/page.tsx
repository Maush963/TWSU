import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RELATED_ARTICLES_LIMIT } from "@/lib/constants";
import { uiText } from "@/content/ui-text";
import { getArticleBySlug, getArticleSlugs, getRelatedArticles } from "@/lib/data/articles";

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/perspectives/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  return article ? { title: article.title, description: article.excerpt } : {};
}

// Temporal: solo comprueba que los datos llegan. El diseño es de la Fase 1.
export default async function ArticlePage({ params }: PageProps<"/perspectives/[slug]">) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  const related = await getRelatedArticles(article, RELATED_ARTICLES_LIMIT);

  return (
    <main className="p-4">
      <h1 className="font-display text-2xl">{article.title}</h1>
      <p className="text-muted">{article.excerpt}</p>
      {related.length > 0 && (
        <section aria-labelledby="related">
          <h2 id="related" className="text-lg">
            {uiText.article.related}
          </h2>
          <ul>
            {related.map((item) => (
              <li key={item.id}>
                <Link href={`/perspectives/${item.slug}`}>{item.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
