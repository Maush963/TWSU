import { describe, expect, it } from "vitest";
import { MIN_FILL_MS } from "@/lib/constants";
import { isSpam } from "@/lib/forms/antispam";

const NOW = 1_000_000;

describe("isSpam", () => {
  it("deja pasar un envío normal", () => {
    expect(isSpam({ website: "", startedAt: NOW - MIN_FILL_MS - 1 }, NOW)).toBe(false);
  });

  it("acepta el campo trampa ausente o nulo", () => {
    expect(isSpam({ startedAt: NOW - 10_000 }, NOW)).toBe(false);
    expect(isSpam({ website: null, startedAt: NOW - 10_000 }, NOW)).toBe(false);
  });

  it("descarta si el campo trampa tiene algo", () => {
    expect(isSpam({ website: "http://spam.example", startedAt: NOW - 10_000 }, NOW)).toBe(true);
    expect(isSpam({ website: " x ", startedAt: NOW - 10_000 }, NOW)).toBe(true);
  });

  it("no descarta un campo trampa que solo tiene espacios", () => {
    expect(isSpam({ website: "   ", startedAt: NOW - 10_000 }, NOW)).toBe(false);
  });

  it("descarta un envío más rápido que el mínimo", () => {
    expect(isSpam({ startedAt: NOW - (MIN_FILL_MS - 1) }, NOW)).toBe(true);
  });

  it("acepta justo el tiempo mínimo", () => {
    expect(isSpam({ startedAt: NOW - MIN_FILL_MS }, NOW)).toBe(false);
  });

  it("descarta si no hay hora de inicio, o no es un número válido, o está en el futuro", () => {
    expect(isSpam({}, NOW)).toBe(true);
    expect(isSpam({ startedAt: Number.NaN }, NOW)).toBe(true);
    expect(isSpam({ startedAt: NOW + 5_000 }, NOW)).toBe(true);
  });
});
