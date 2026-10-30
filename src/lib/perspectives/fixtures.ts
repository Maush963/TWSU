import type { ArticleSummary } from "@/lib/sanity/types";

// Datos fijos para las pruebas de esta carpeta.
export const FEATURED: ArticleSummary = {
  id: "a1",
  slug: "destacado",
  title: "Destacado",
  excerpt: "",
  publishedAt: "2026-05-01T00:00:00Z",
  year: 2026,
  categories: ["branding", "storytelling"],
  cover: { asset: { _ref: "image-x", _type: "reference" }, alt: "" },
};
