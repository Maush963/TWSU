import { describe, expect, it } from "vitest";
import { getClientKey } from "@/lib/forms/client-ip";

describe("getClientKey", () => {
  it("toma la primera IP de x-forwarded-for", () => {
    expect(getClientKey(new Headers({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("1.1.1.1");
  });

  it("usa x-real-ip si no hay x-forwarded-for", () => {
    expect(getClientKey(new Headers({ "x-real-ip": "3.3.3.3" }))).toBe("3.3.3.3");
  });

  it("agrupa en una sola clave cuando no hay ninguna", () => {
    expect(getClientKey(new Headers())).toBe("unknown");
    expect(getClientKey(new Headers({ "x-forwarded-for": "  " }))).toBe("unknown");
  });
});
