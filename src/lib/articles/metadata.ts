import type { Metadata } from "next";
import type { ArticleSummary } from "@/lib/sanity/types";

/**
 * Metadatos de un artículo. `imageUrl` llega ya resuelto (con `urlFor`) para que la función
 * siga pura. La URL canónica es relativa: `metadataBase` del layout la completa.
 */
export function buildArticleMetadata(article: ArticleSummary, imageUrl: string | null): Metadata {
  const path = `/perspectives/${article.slug}`;
  return {
    title: article.title,
    // Sin resumen no se pone descripción propia y vale la del sitio.
    ...(article.excerpt ? { description: article.excerpt } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: article.title,
      ...(article.excerpt ? { description: article.excerpt } : {}),
      url: path,
      publishedTime: article.publishedAt,
      ...(imageUrl ? { images: [{ url: imageUrl, alt: article.cover.alt }] } : {}),
    },
  };
}
