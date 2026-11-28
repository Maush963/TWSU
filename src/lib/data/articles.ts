import "server-only";
import {
  HOME_LARGE_COUNT,
  HOME_RECENT_LIMIT,
  HOME_SMALL_COUNT,
  PERSPECTIVES_PAGE_SIZE,
  type Category,
} from "@/lib/constants";
import { sanityFetch } from "@/lib/sanity/client";
import {
  ARTICLES_PAGE_QUERY,
  ARTICLE_BY_SLUG_QUERY,
  ARTICLE_SLUGS_QUERY,
  FEATURED_ARTICLE_QUERY,
  HOME_LARGE_QUERY,
  HOME_SMALL_QUERY,
  RECENT_ARTICLES_QUERY,
  RELATED_ARTICLES_QUERY,
} from "@/lib/sanity/queries";
import type {
  ARTICLES_PAGE_QUERY_RESULT,
  ARTICLE_BY_SLUG_QUERY_RESULT,
  ARTICLE_SLUGS_QUERY_RESULT,
  FEATURED_ARTICLE_QUERY_RESULT,
  HOME_LARGE_QUERY_RESULT,
  HOME_SMALL_QUERY_RESULT,
  RECENT_ARTICLES_QUERY_RESULT,
  RELATED_ARTICLES_QUERY_RESULT,
} from "@/lib/sanity/sanity.types";
import type { Article, ArticleFilterParams, ArticleSummary, Paginated } from "@/lib/sanity/types";
import { compact, toArticle, toArticleSummary } from "./mappers";

const TAGS = ["article", "place"];

/**
 * El destacado de Perspectives (`perspectivesFeatured`) más reciente, o null. Con
 * `category`, el de esa categoría: el marcado más reciente o, si ninguno lo está, el artículo más
 * reciente de ella.
 */
export async function getFeaturedArticle(category?: Category): Promise<Article | null> {
  const raw = await sanityFetch<FEATURED_ARTICLE_QUERY_RESULT>(
    FEATURED_ARTICLE_QUERY,
    { category: category ?? null },
    TAGS,
  );
  return raw ? toArticle(raw) : null;
}

export async function getRecentArticles(limit: number, excludeIds: readonly string[] = []): Promise<ArticleSummary[]> {
  const raw = await sanityFetch<RECENT_ARTICLES_QUERY_RESULT>(
    RECENT_ARTICLES_QUERY,
    { limit, excludeIds: [...excludeIds] },
    TAGS,
  );
  return compact(raw.map(toArticleSummary));
}

/**
 * Los artículos de la Home, en orden: los 2 grandes (los marcados en Studio) y los 4 pequeños (los
 * marcados "pequeño", los más recientes primero). Si falta alguno para completar los lugares,
 * entran los más recientes. Nada se repite.
 */
export async function getHomeArticles(): Promise<ArticleSummary[]> {
  const raw = await sanityFetch<HOME_LARGE_QUERY_RESULT>(HOME_LARGE_QUERY, {}, TAGS);
  const large = compact([raw.first, raw.second].map((item) => (item ? toArticleSummary(item) : null)));
  const smallRaw = await sanityFetch<HOME_SMALL_QUERY_RESULT>(
    HOME_SMALL_QUERY,
    { limit: HOME_SMALL_COUNT, excludeIds: large.map((a) => a.id) },
    TAGS,
  );
  const small = compact(smallRaw.map(toArticleSummary));
  const recent = await getRecentArticles(HOME_RECENT_LIMIT, [...large, ...small].map((a) => a.id));
  const fillLarge = recent.splice(0, HOME_LARGE_COUNT - large.length);
  return [...large, ...fillLarge, ...small, ...recent].slice(0, HOME_RECENT_LIMIT);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const raw = await sanityFetch<ARTICLE_BY_SLUG_QUERY_RESULT>(ARTICLE_BY_SLUG_QUERY, { slug }, TAGS);
  return raw ? toArticle(raw) : null;
}

/** Slugs publicados, para `generateStaticParams`. */
export async function getArticleSlugs(): Promise<string[]> {
  const raw = await sanityFetch<ARTICLE_SLUGS_QUERY_RESULT>(ARTICLE_SLUGS_QUERY, {}, ["article"]);
  return raw.filter((slug): slug is string => Boolean(slug));
}

/** Más categorías en común primero, luego los más recientes, sin el artículo actual. */
export async function getRelatedArticles(article: Article, limit: number): Promise<ArticleSummary[]> {
  const raw = await sanityFetch<RELATED_ARTICLES_QUERY_RESULT>(
    RELATED_ARTICLES_QUERY,
    { id: article.id, categories: article.categories, limit },
    TAGS,
  );
  return compact(raw.map(toArticleSummary));
}

async function fetchPage(category: string | null, page: number, excludeId: string | null) {
  const from = (page - 1) * PERSPECTIVES_PAGE_SIZE;
  return sanityFetch<ARTICLES_PAGE_QUERY_RESULT>(
    ARTICLES_PAGE_QUERY,
    { category, excludeId, from, to: from + PERSPECTIVES_PAGE_SIZE },
    TAGS,
  );
}

/**
 * Si la página pedida pasa de la última, devuelve la última. `excludeId` saca un artículo del
 * listado y del total (el destacado de Perspectives, que se pinta aparte).
 */
export async function listArticles(
  filters: ArticleFilterParams,
  excludeId?: string,
): Promise<Paginated<ArticleSummary>> {
  const category = filters.category ?? null;
  const exclude = excludeId ?? null;
  let page = Math.max(1, filters.page);
  let raw = await fetchPage(category, page, exclude);
  const totalPages = Math.max(1, Math.ceil(raw.total / PERSPECTIVES_PAGE_SIZE));
  if (page > totalPages) {
    page = totalPages;
    raw = await fetchPage(category, page, exclude);
  }
  return { items: compact(raw.items.map(toArticleSummary)), page, totalPages, total: raw.total };
}
