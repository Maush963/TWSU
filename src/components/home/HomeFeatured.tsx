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
      <h2 id="home-featured-title" className="mb-8 font-ui text-sm uppercase tracking-caps-wide">
        {uiText.home.featured}
      </h2>
      {articles.length === 0 ? (
        <p className="font-body">{uiText.home.empty}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-y-8 lg:grid-cols-3 lg:gap-x-8">
          {articles.map((article) => (
            <li
              key={article.id}
              className="home-featured-item relative flex gap-4 focus-within:outline-2 focus-within:outline-accent lg:gap-6"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <h3 className="font-display text-xl uppercase leading-none text-accent">
                  <Link href={`/perspectives/${article.slug}`} className="outline-none after:absolute after:inset-0">
                    {article.title}
                  </Link>
                </h3>
                <p className="line-clamp-4 font-body text-sm lg:text-base">{article.excerpt}</p>
                <span className="mt-auto flex items-center gap-2 self-start border-b border-gold text-accent" aria-hidden>
                  {uiText.home.readArticle}
                  <ArrowRightIcon className="size-4" />
                </span>
              </div>
              <Image
                src={urlFor(article.cover).width(640).height(640).fit("crop").url()}
                alt={article.cover.alt}
                width={640}
                height={640}
                sizes="(min-width: 64rem) 13vw, 40vw"
                className="home-featured-image aspect-square w-2/5 shrink-0 self-start object-cover"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
