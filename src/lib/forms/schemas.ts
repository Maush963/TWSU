import { z } from "zod";
import { EMAIL_MAX_LENGTH } from "@/lib/constants";

/** Claves de error de un campo. El texto que ve la persona sale de `ui-text`, no de aquí. */
export const FORM_ERROR_KEYS = ["required", "invalid", "tooLong"] as const;
export type FormErrorKey = (typeof FORM_ERROR_KEYS)[number];

const trimmed = (value: unknown) => (typeof value === "string" ? value.trim() : value);

const email = z.preprocess(
  trimmed,
  z
    .string({ error: "required" })
    .min(1, { error: "required" })
    .max(EMAIL_MAX_LENGTH, { error: "tooLong" })
    .pipe(z.email({ error: "invalid" })),
);

// Campos que usa el antispam; no son del formulario visible.
const spamFields = {
  website: z.string().nullish(),
  startedAt: z.number().optional(),
};

export const subscribeSchema = z.object({ email, ...spamFields });

export type SubscribeInput = z.infer<typeof subscribeSchema>;

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
