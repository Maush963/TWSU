import { describe, expect, it } from "vitest";
import { EMAIL_MAX_LENGTH } from "@/lib/constants";
import { getFieldErrors, subscribeSchema } from "@/lib/forms/schemas";

describe("subscribeSchema", () => {
  it("acepta un correo válido y lo recorta", () => {
    const result = subscribeSchema.safeParse({ email: "  ana@example.com " });
    expect(result.success && result.data.email).toBe("ana@example.com");
  });

  it("rechaza un correo vacío o ausente como obligatorio", () => {
    for (const input of [{ email: "" }, { email: "   " }, {}]) {
      const result = subscribeSchema.safeParse(input);
      expect(result.success ? {} : getFieldErrors(result.error)).toEqual({ email: "required" });
    }
  });

  it("rechaza un correo mal escrito", () => {
    const result = subscribeSchema.safeParse({ email: "ana@" });
    expect(result.success ? {} : getFieldErrors(result.error)).toEqual({ email: "invalid" });
  });

  it("rechaza un correo demasiado largo", () => {
    const long = `${"a".repeat(EMAIL_MAX_LENGTH)}@example.com`;
    const result = subscribeSchema.safeParse({ email: long });
    expect(result.success ? {} : getFieldErrors(result.error)).toEqual({ email: "tooLong" });
  });

  it("deja pasar los campos del antispam y rechaza un tipo que no es texto", () => {
    expect(subscribeSchema.safeParse({ email: "a@b.co", website: null, startedAt: 1 }).success).toBe(true);
    expect(subscribeSchema.safeParse({ email: 5 }).success).toBe(false);
  });
});

describe("getFieldErrors", () => {
  it("devuelve solo el primer error de cada campo", () => {
    const result = subscribeSchema.safeParse({ email: "" });
    expect(result.success ? {} : getFieldErrors(result.error)).toEqual({ email: "required" });
  });

  it("toma un valor que no es texto como campo obligatorio", () => {
    const result = subscribeSchema.safeParse({ email: 7 });
    expect(result.success ? {} : getFieldErrors(result.error)).toEqual({ email: "required" });
  });
});
