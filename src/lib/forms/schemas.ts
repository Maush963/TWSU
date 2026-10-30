import { z } from "zod";
import {
  COMPANY_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_MIN_DIGITS,
} from "@/lib/constants";

/** Claves de error de un campo. El texto que ve la persona sale de `ui-text`, no de aquí. */
export const FORM_ERROR_KEYS = ["required", "invalid", "tooLong"] as const;
export type FormErrorKey = (typeof FORM_ERROR_KEYS)[number];

const trimmed = (value: unknown) => (typeof value === "string" ? value.trim() : value);
const emptyToUndefined = (value: unknown) => {
  const text = trimmed(value);
  return text === "" || text === null ? undefined : text;
};

const requiredText = (max: number) =>
  z.preprocess(
    trimmed,
    z.string({ error: "required" }).min(1, { error: "required" }).max(max, { error: "tooLong" }),
  );

const email = z.preprocess(
  trimmed,
  z
    .string({ error: "required" })
    .min(1, { error: "required" })
    .max(EMAIL_MAX_LENGTH, { error: "tooLong" })
    .pipe(z.email({ error: "invalid" })),
);

const phone = z.preprocess(
  trimmed,
  z
    .string({ error: "required" })
    .min(1, { error: "required" })
    .max(PHONE_MAX_LENGTH, { error: "tooLong" })
    .refine((value) => /^\+?[\d\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= PHONE_MIN_DIGITS, {
      error: "invalid",
    }),
);

const message = z.preprocess(
  emptyToUndefined,
  z.string({ error: "invalid" }).max(MESSAGE_MAX_LENGTH, { error: "tooLong" }).optional(),
);

// Campos que usa el antispam; no son del formulario visible.
const spamFields = {
  website: z.string().nullish(),
  startedAt: z.number().optional(),
};

export const subscribeSchema = z.object({ email, ...spamFields });

export const contactSchema = z.object({
  name: requiredText(NAME_MAX_LENGTH),
  phone,
  company: requiredText(COMPANY_MAX_LENGTH),
  email,
  message,
  ...spamFields,
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type ContactInput = z.infer<typeof contactSchema>;

/** Primer error de cada campo, como clave. Un error que no es nuestro se toma como `invalid`. */
export function getFieldErrors(error: z.ZodError): Partial<Record<string, FormErrorKey>> {
  const errors: Partial<Record<string, FormErrorKey>> = {};
  for (const issue of error.issues) {
    const field = issue.path.join(".");
    if (field === "" || field in errors) continue;
    errors[field] = (FORM_ERROR_KEYS as readonly string[]).includes(issue.message)
      ? (issue.message as FormErrorKey)
      : "invalid";
  }
  return errors;
}
