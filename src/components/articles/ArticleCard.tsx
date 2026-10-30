import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { uiText } from "@/content/ui-text";
import { urlFor } from "@/lib/sanity/image";
import type { ArticleSummary } from "@/lib/sanity/types";

interface ArticleCardProps {
  article: ArticleSummary;
  /** Ancho que ocupa la portada según la rejilla donde se use. */
  sizes: string;
}

// Un solo enlace por tarjeta: el del título se estira sobre toda la tarjeta.
export function ArticleCard({ article, sizes }: ArticleCardProps) {
  return (
    <article className="relative flex flex-col bg-surface focus-within:outline-2 focus-within:outline-accent">
      <Image
        src={urlFor(article.cover).width(640).height(360).fit("crop").url()}
        alt={article.cover.alt}
        width={640}
        height={360}
        sizes={sizes}
        className="aspect-video w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <h3 className="font-display text-xl leading-tight text-accent">
          <Link href={`/perspectives/${article.slug}`} className="outline-none after:absolute after:inset-0">
            {article.title}
          </Link>
        </h3>
        <p className="line-clamp-3 font-body">{article.excerpt}</p>
        <span className="mt-auto flex items-center gap-2 self-end border-b border-gold text-sm text-accent" aria-hidden>
          {uiText.perspectives.readMore}
          <ArrowRightIcon className="size-4" />
        </span>
      </div>
    </article>
  );
}
