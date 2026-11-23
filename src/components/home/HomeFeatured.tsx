import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { uiText } from "@/content/ui-text";
import { urlFor } from "@/lib/sanity/image";
import type { ArticleSummary } from "@/lib/sanity/types";

// Bloque "Featured" de la Home: los dos primeros artículos en grande (portada arriba, texto debajo
// con una línea dorada a la izquierda) y los siguientes en una fila de cuatro, más pequeños.
// Un solo enlace por artículo: el del título se estira sobre toda la tarjeta.
const LARGE_COUNT = 2;

function Card({ article, large }: { article: ArticleSummary; large: boolean }) {
  const width = large ? 1200 : 640;
  const height = large ? 600 : 380;
  return (
    <li className={`home-card ${large ? "home-card-large" : "home-card-small"} relative focus-within:outline-2 focus-within:outline-accent`}>
      <Image
        src={urlFor(article.cover).width(width).height(height).fit("crop").url()}
        alt={article.cover.alt}
        width={width}
        height={height}
        sizes={large ? "(min-width: 64rem) 44vw, 100vw" : "(min-width: 64rem) 22vw, 100vw"}
        className="home-card-image w-full object-cover"
      />
      <div className="home-card-body">
        <h3 className="home-card-title fit-clamp font-display leading-tight text-accent">
          <Link href={`/perspectives/${article.slug}`} className="outline-none after:absolute after:inset-0">
            {article.title}
          </Link>
        </h3>
        <p className="home-card-excerpt fit-clamp fit-clamp-text [--fit-lines:3] font-body">{article.excerpt}</p>
        <span className="home-card-link flex items-center gap-2 self-end border-b border-gold text-accent" aria-hidden>
          {large ? uiText.home.readArticle : uiText.home.readMore}
          <ArrowRightIcon className="size-4 text-gold" />
        </span>
      </div>
    </li>
  );
}

export function HomeFeatured({ articles }: { articles: readonly ArticleSummary[] }) {
  const large = articles.slice(0, LARGE_COUNT);
  const small = articles.slice(LARGE_COUNT);

  return (
    <section aria-labelledby="home-featured-title" className="home-featured bg-surface">
      <h2 id="home-featured-title" className="mb-8 font-ui text-base uppercase tracking-caps lg:text-xl lg:tracking-normal">
        {uiText.home.featured}
      </h2>
      {articles.length === 0 ? (
        <p className="font-body">{uiText.home.empty}</p>
      ) : (
        <>
          <ul className="home-featured-large">
            {large.map((article) => (
              <Card key={article.id} article={article} large />
            ))}
          </ul>
          {small.length > 0 && (
            <ul className="home-featured-small">
              {small.map((article) => (
                <Card key={article.id} article={article} large={false} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
