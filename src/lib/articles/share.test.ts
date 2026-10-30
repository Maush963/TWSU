import { describe, expect, it } from "vitest";
import { buildShareLinks } from "./share";

const URL_ARTICLE = "https://twsu.test/perspectives/mi-articulo";

describe("buildShareLinks", () => {
  it("codifica la URL del artículo en cada red", () => {
    const links = buildShareLinks(URL_ARTICLE, "Título");
    const encoded = encodeURIComponent(URL_ARTICLE);
    expect(links.facebook).toBe(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`);
    expect(links.linkedin).toBe(`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`);
    expect(links.x).toContain(`url=${encoded}`);
  });

  it("codifica el título para que no rompa la URL", () => {
    const { x } = buildShareLinks(URL_ARTICLE, "Cities & ideas? 100% #1");
    const params = new URL(x).searchParams;
    expect(params.get("text")).toBe("Cities & ideas? 100% #1");
    expect(params.get("url")).toBe(URL_ARTICLE);
  });
});
