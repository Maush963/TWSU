import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { uiText } from "@/content/ui-text";
import { titleSize, type TitleLength } from "@/lib/articles/title";
import { urlFor } from "@/lib/sanity/image";
import type { ArticleSummary } from "@/lib/sanity/types";

interface ArticleCardProps {
  article: ArticleSummary;
  /** Ancho que ocupa la portada según la rejilla donde se use. */
  sizes: string;
}

// Tamaño del título según su largo, hasta 3 líneas.
const TITLE_SIZES: Record<TitleLength, string> = {
  short: "text-base lg:text-xl",
  medium: "text-base lg:text-lg",
  long: "text-sm lg:text-base",
};

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
      <div className="flex flex-1 flex-col gap-2 p-2 lg:gap-4 lg:p-4">
        <h3 className={`fit-clamp [--fit-lines:3] font-display leading-tight text-accent ${titleSize(article.title, TITLE_SIZES)}`}>
          <Link href={`/perspectives/${article.slug}`} className="outline-none after:absolute after:inset-0">
            {article.title}
          </Link>
        </h3>
        <p className="fit-clamp fit-clamp-text [--fit-lines:3] font-body text-sm lg:text-base">{article.excerpt}</p>
        <span className="mt-auto flex items-center gap-2 self-end border-b border-gold text-xs text-accent lg:text-sm" aria-hidden>
          {uiText.perspectives.readMore}
          <ArrowRightIcon className="size-4" />
        </span>
      </div>
    </article>
  );
}
