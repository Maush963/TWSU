import { describe, expect, it } from "vitest";
import {
  COMPANY_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
} from "@/lib/constants";
import { contactSchema, getFieldErrors, subscribeSchema } from "@/lib/forms/schemas";

const validContact = {
  name: "Ana Pérez",
  phone: "+52 55 1234 5678",
  company: "TWSU",
  email: "ana@example.com",
};

function contactErrors(input: unknown) {
  const result = contactSchema.safeParse(input);
  return result.success ? {} : getFieldErrors(result.error);
}

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

describe("contactSchema", () => {
  it("acepta un contacto completo sin mensaje", () => {
    const result = contactSchema.safeParse(validContact);
    expect(result.success && result.data.message).toBeUndefined();
  });

  it("recorta espacios y trata un mensaje vacío como ausente", () => {
    const result = contactSchema.safeParse({ ...validContact, name: "  Ana ", message: "   " });
    expect(result.success && result.data.name).toBe("Ana");
    expect(result.success && result.data.message).toBeUndefined();
  });

  it("marca como obligatorios los cuatro campos", () => {
    expect(contactErrors({})).toEqual({
      name: "required",
      phone: "required",
      company: "required",
      email: "required",
    });
  });

  it("acepta teléfonos con y sin prefijo", () => {
    for (const phone of ["5512345678", "+34 600 123 456", "(55) 1234-5678", "555.123.4567"]) {
      expect(contactErrors({ ...validContact, phone })).toEqual({});
    }
  });

  it("rechaza teléfonos con letras o muy cortos", () => {
    for (const phone of ["abc1234567", "12345", "555-CALL-NOW", "++52 5512345678"]) {
      expect(contactErrors({ ...validContact, phone })).toEqual({ phone: "invalid" });
    }
  });

  it("marca los textos demasiado largos", () => {
    expect(
      contactErrors({
        ...validContact,
        name: "a".repeat(NAME_MAX_LENGTH + 1),
        company: "a".repeat(COMPANY_MAX_LENGTH + 1),
        message: "a".repeat(MESSAGE_MAX_LENGTH + 1),
      }),
    ).toEqual({ name: "tooLong", company: "tooLong", message: "tooLong" });
  });

  it("acepta los largos exactos del límite", () => {
    expect(
      contactErrors({
        ...validContact,
        name: "a".repeat(NAME_MAX_LENGTH),
        message: "a".repeat(MESSAGE_MAX_LENGTH),
      }),
    ).toEqual({});
  });
});

describe("getFieldErrors", () => {
  it("devuelve solo el primer error de cada campo", () => {
    const result = contactSchema.safeParse({ ...validContact, email: "" });
    expect(result.success ? {} : getFieldErrors(result.error)).toEqual({ email: "required" });
  });

  it("toma un valor que no es texto como campo obligatorio", () => {
    const result = contactSchema.safeParse({ ...validContact, name: 7 });
    expect(result.success ? {} : getFieldErrors(result.error)).toEqual({ name: "required" });
  });
});
