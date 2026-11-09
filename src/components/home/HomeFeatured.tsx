import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { uiText } from "@/content/ui-text";
import { urlFor } from "@/lib/sanity/image";
import type { ArticleSummary } from "@/lib/sanity/types";

// Bloque "Featured" de la Home: el destacado y los recientes (tres columnas desde `lg`).
// Cada uno lleva título y texto a la izquierda y la portada cuadrada a la derecha. Un solo enlace
// por artículo: el del título se estira sobre todo el bloque.
export function HomeFeatured({ articles }: { articles: readonly ArticleSummary[] }) {
  return (
    <section aria-labelledby="home-featured-title" className="home-featured bg-surface">
      <h2 id="home-featured-title" className="mb-8 font-ui text-base uppercase tracking-caps-wide lg:text-lg">
        {uiText.home.featured}
      </h2>
      {articles.length === 0 ? (
        <p className="font-body">{uiText.home.empty}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-y-10 lg:grid-cols-3 lg:gap-x-8">
          {articles.map((article) => (
            <li
              key={article.id}
              className="home-featured-item relative focus-within:outline-2 focus-within:outline-accent"
            >
              <div className="home-featured-text flex flex-col gap-2">
                <h3 className="shrink-0 font-display text-title uppercase leading-none text-accent">
                  <Link href={`/perspectives/${article.slug}`} className="outline-none after:absolute after:inset-0">
                    {article.title}
                  </Link>
                </h3>
                <p className="line-clamp-3 min-h-0 overflow-hidden font-body text-sm lg:text-base">{article.excerpt}</p>
                <span className="mt-auto flex shrink-0 items-center gap-2 self-start border-b border-gold text-accent" aria-hidden>
                  {uiText.home.readArticle}
                  <ArrowRightIcon className="size-4" />
                </span>
              </div>
              <Image
                src={urlFor(article.cover).width(640).height(640).fit("crop").url()}
                alt={article.cover.alt}
                width={640}
                height={640}
                sizes="(min-width: 64rem) 16vw, 45vw"
                className="home-featured-image aspect-square w-full object-cover"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
