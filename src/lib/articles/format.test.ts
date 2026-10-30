import { describe, expect, it } from "vitest";
import { formatArticleDate } from "./format";

describe("formatArticleDate", () => {
  it("da la fecha larga en el idioma pedido", () => {
    expect(formatArticleDate("2026-03-15T12:00:00Z", "es")).toBe("15 de marzo de 2026");
    expect(formatArticleDate("2026-03-15T12:00:00Z", "en")).toBe("March 15, 2026");
  });

  it("no cambia de día cerca de la medianoche UTC", () => {
    expect(formatArticleDate("2026-03-15T00:00:00Z", "es")).toBe("15 de marzo de 2026");
    expect(formatArticleDate("2026-03-15T23:59:59Z", "es")).toBe("15 de marzo de 2026");
  });

  it("una fecha inválida o vacía devuelve cadena vacía", () => {
    expect(formatArticleDate("no es fecha", "es")).toBe("");
    expect(formatArticleDate("", "es")).toBe("");
  });
});
