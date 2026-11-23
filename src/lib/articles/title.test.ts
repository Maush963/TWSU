import { describe, expect, it } from "vitest";
import { titleLength, titleSize } from "./title";

describe("titleLength", () => {
  it("clasifica por número de caracteres", () => {
    expect(titleLength("Lorem ipsum")).toBe("short");
    expect(titleLength("a".repeat(28))).toBe("short");
    expect(titleLength("a".repeat(29))).toBe("medium");
    expect(titleLength("a".repeat(44))).toBe("medium");
    expect(titleLength("a".repeat(45))).toBe("long");
  });

  it("ignora espacios en los extremos", () => {
    expect(titleLength(`  ${"a".repeat(28)}  `)).toBe("short");
  });

  it("titleSize devuelve la clase del largo", () => {
    expect(titleSize("Hola", { short: "a", medium: "b", long: "c" })).toBe("a");
  });
});
