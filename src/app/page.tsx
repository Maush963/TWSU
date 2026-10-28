import type { Metadata } from "next";
import Link from "next/link";
import { HOME_RECENT_LIMIT } from "@/lib/constants";
import { uiText } from "@/content/ui-text";
import { getFeaturedArticle, getRecentArticles } from "@/lib/data/articles";

export const metadata: Metadata = { title: uiText.home.title };

// Temporal: solo comprueba que los datos llegan. El diseño es de la Fase 1.
export default async function HomePage() {
  const featured = await getFeaturedArticle();
  const recent = await getRecentArticles(HOME_RECENT_LIMIT, featured?.id);

  return (
    <main className="p-4">
      <h1 className="font-display text-2xl">{uiText.home.title}</h1>
      {!featured && recent.length === 0 && <p className="text-muted">{uiText.home.empty}</p>}
      {featured && (
        <section aria-labelledby="home-featured">
          <h2 id="home-featured" className="text-lg">
            {uiText.home.featured}
          </h2>
          <Link href={`/perspectives/${featured.slug}`}>{featured.title}</Link>
        </section>
      )}
      {recent.length > 0 && (
        <section aria-labelledby="home-recent">
          <h2 id="home-recent" className="text-lg">
            {uiText.home.recent}
          </h2>
          <ul>
            {recent.map((article) => (
              <li key={article.id}>
                <Link href={`/perspectives/${article.slug}`}>{article.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
