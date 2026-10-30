import { describe, expect, it } from "vitest";
import { parseImageRef } from "./body-image";

describe("parseImageRef", () => {
  it("lee el tamaño de una referencia válida", () => {
    expect(parseImageRef("image-fbf0d835b5afd731b0433d943acd8e2c8bc1f72a-1200x675-png")).toEqual({
      width: 1200,
      height: 675,
    });
  });

  it("devuelve null si no coincide o el tamaño es cero", () => {
    expect(parseImageRef("")).toBeNull();
    expect(parseImageRef("file-abc-pdf")).toBeNull();
    expect(parseImageRef("image-abc-0x675-png")).toBeNull();
  });
});
