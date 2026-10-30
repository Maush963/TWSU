import { describe, expect, it } from "vitest";
import type { ArticleSummary } from "@/lib/sanity/types";
import { buildArticleMetadata } from "./metadata";

const ARTICLE: ArticleSummary = {
  id: "a1",
  slug: "mi-articulo",
  title: "Mi artículo",
  excerpt: "Un resumen.",
  publishedAt: "2026-05-01T00:00:00Z",
  year: 2026,
  categories: ["branding"],
  cover: { asset: { _ref: "image-x", _type: "reference" }, alt: "Portada" },
};

describe("buildArticleMetadata", () => {
  it("usa título, resumen, fecha e imagen", () => {
    const metadata = buildArticleMetadata(ARTICLE, "https://cdn.test/portada.jpg");
    expect(metadata.title).toBe("Mi artículo");
    expect(metadata.description).toBe("Un resumen.");
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-05-01T00:00:00Z",
      images: [{ url: "https://cdn.test/portada.jpg", alt: "Portada" }],
    });
  });

  it("la URL canónica usa el slug", () => {
    expect(buildArticleMetadata(ARTICLE, null).alternates?.canonical).toBe("/perspectives/mi-articulo");
  });

  it("sin resumen no pone descripción propia", () => {
    const metadata = buildArticleMetadata({ ...ARTICLE, excerpt: "" }, null);
    expect(metadata).not.toHaveProperty("description");
    expect(metadata.openGraph).not.toHaveProperty("description");
  });

  it("sin imagen no pone images", () => {
    expect(buildArticleMetadata(ARTICLE, null).openGraph).not.toHaveProperty("images");
  });
});
