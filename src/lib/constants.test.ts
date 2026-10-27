import { describe, expect, it } from "vitest";
import { isCategory, isContinent } from "@/lib/constants";

describe("isCategory", () => {
  it("acepta las cinco llaves", () => {
    for (const value of ["storytelling", "plataformas", "campanas", "branding", "social-media"]) {
      expect(isCategory(value)).toBe(true);
    }
  });

  it("rechaza valores inválidos", () => {
    for (const value of ["", "xxx", "Branding", "europa", " branding"]) {
      expect(isCategory(value)).toBe(false);
    }
  });
});

describe("isContinent", () => {
  it("acepta los cinco continentes", () => {
    for (const value of ["america", "europa", "asia", "africa", "oceania"]) {
      expect(isContinent(value)).toBe(true);
    }
  });

  it("rechaza valores inválidos", () => {
    for (const value of ["", "xxx", "Europa", "branding", "antartida"]) {
      expect(isContinent(value)).toBe(false);
    }
  });
});
