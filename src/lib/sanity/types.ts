import type { PortableTextBlock } from "@portabletext/types";
import type { Category, Continent } from "@/lib/constants";

// Tipos de dominio que usa la app. No dependen de la forma de las consultas GROQ.

export interface CoverImage {
  asset: { _ref: string; _type: "reference" };
  alt: string;
  crop?: { top?: number; bottom?: number; left?: number; right?: number };
  hotspot?: { x?: number; y?: number; height?: number; width?: number };
}

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  year: number;
  categories: Category[];
  cover: CoverImage;
  placeName?: string;
  continent?: Continent;
}

export interface Article extends ArticleSummary {
  featured: boolean;
  inAtlas: boolean;
  body: PortableTextBlock[];
}

export interface AtlasPinData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  placeName: string;
  continent: Continent;
  categories: Category[];
  lat: number;
  lng: number;
  x: number;
  y: number;
}

export interface ArticleFilterParams {
  category?: Category;
  page: number;
}

export interface AtlasFilterParams {
  category?: Category;
  region?: Continent;
  year?: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
}
