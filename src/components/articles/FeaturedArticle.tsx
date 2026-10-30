import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { uiText } from "@/content/ui-text";
import { urlFor } from "@/lib/sanity/image";
import type { ArticleSummary } from "@/lib/sanity/types";

// Un solo enlace: el del título se estira sobre todo el bloque.
export function FeaturedArticle({ article }: { article: ArticleSummary }) {
  return (
    <article className="relative flex flex-col gap-6 focus-within:outline-2 focus-within:outline-accent">
      <p className="font-ui text-xs uppercase tracking-caps-wide">{uiText.perspectives.latest}</p>
      <h2 className="font-display text-3xl uppercase leading-none text-accent">
        <Link href={`/perspectives/${article.slug}`} className="outline-none after:absolute after:inset-0">
          {article.title}
        </Link>
      </h2>
      <Image
        src={urlFor(article.cover).width(1200).height(675).fit("crop").url()}
        alt={article.cover.alt}
        width={1200}
        height={675}
        sizes="(min-width: 64rem) 35vw, 100vw"
        priority
        className="aspect-video w-full object-cover"
      />
      <div className="flex flex-col gap-4 border-l border-gold pl-6">
        <p className="font-ui text-xs uppercase tracking-caps">{uiText.perspectives.about}</p>
        <p className="font-body">{article.excerpt}</p>
        <span className="flex items-center gap-2 self-end border-b border-gold text-accent" aria-hidden>
          {uiText.perspectives.readFull}
          <ArrowRightIcon className="size-4" />
        </span>
      </div>
    </article>
  );
}
