import "server-only";
import type { PortableTextBlock } from "@portabletext/types";
import { isCategory, isContinent, type Category, type Continent } from "@/lib/constants";
import { project } from "@/lib/atlas/project";
import type {
  ARTICLE_BY_SLUG_QUERY_RESULT,
  ATLAS_PINS_QUERY_RESULT,
  RECENT_ARTICLES_QUERY_RESULT,
} from "@/lib/sanity/sanity.types";
import type { Article, ArticleSummary, AtlasPinData, CoverImage } from "@/lib/sanity/types";

// Los resultados de TypeGen admiten null en todo. Aquí se comprueban los datos obligatorios
// y, si falta alguno, el registro se descarta en lugar de romper la página.

type RawSummary = RECENT_ARTICLES_QUERY_RESULT[number];
type RawArticle = NonNullable<ARTICLE_BY_SLUG_QUERY_RESULT>;
type RawPin = ATLAS_PINS_QUERY_RESULT[number];

export function toCategories(values: readonly string[] | null): Category[] {
  return (values ?? []).filter(isCategory);
}

function toContinent(value: string | null): Continent | undefined {
  return value && isContinent(value) ? value : undefined;
}

function toCover(cover: RawSummary["cover"]): CoverImage | null {
  const ref = cover?.asset?._ref;
  if (!cover || !ref) return null;
  return {
    asset: { _ref: ref, _type: "reference" },
    alt: cover.alt ?? "",
    ...(cover.crop ? { crop: cover.crop } : {}),
    ...(cover.hotspot ? { hotspot: cover.hotspot } : {}),
  };
}

export function toArticleSummary(raw: RawSummary): ArticleSummary | null {
  const cover = toCover(raw.cover);
  if (!raw.title || !raw.slug || !raw.publishedAt || raw.year === null || !cover) return null;
  const continent = toContinent(raw.continent);
  return {
    id: raw._id,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt ?? "",
    publishedAt: raw.publishedAt,
    year: raw.year,
    categories: toCategories(raw.categories),
    cover,
    ...(raw.placeName ? { placeName: raw.placeName } : {}),
    ...(continent ? { continent } : {}),
  };
}

export function toArticle(raw: RawArticle): Article | null {
  const summary = toArticleSummary(raw);
  if (!summary) return null;
  return {
    ...summary,
    featured: raw.featured ?? false,
    inAtlas: raw.inAtlas ?? false,
    body: (raw.body ?? []) as PortableTextBlock[],
  };
}

export function toAtlasPin(raw: RawPin): AtlasPinData | null {
  const continent = toContinent(raw.continent);
  if (!raw.title || !raw.slug || !raw.placeName || !continent) return null;
  if (typeof raw.lat !== "number" || typeof raw.lng !== "number") return null;
  const { x, y } = project(raw.lat, raw.lng);
  return {
    id: raw._id,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt ?? "",
    placeName: raw.placeName,
    continent,
    categories: toCategories(raw.categories),
    lat: raw.lat,
    lng: raw.lng,
    x,
    y,
  };
}

export function compact<T>(items: (T | null)[]): T[] {
  return items.filter((item): item is T => item !== null);
}
