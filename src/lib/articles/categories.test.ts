import { describe, expect, it } from "vitest";
import { getCategoryTitles } from "./categories";

describe("getCategoryTitles", () => {
  it("sin categorías devuelve una lista vacía", () => {
    expect(getCategoryTitles([])).toEqual([]);
  });

  it("respeta el orden de CATEGORIES, no el de entrada", () => {
    expect(getCategoryTitles(["social-media", "storytelling"])).toEqual(["Storytelling", "Social media"]);
  });

  it("no repite", () => {
    expect(getCategoryTitles(["branding", "branding"])).toEqual(["Branding"]);
  });
});
