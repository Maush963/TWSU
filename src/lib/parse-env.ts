import type { z } from "zod";

/** Valida un origen de variables y, si falta alguna, el error dice cuáles. */
export function parseEnv<T extends z.ZodType>(schema: T, source: unknown, label: string): z.infer<T> {
  const result = schema.safeParse(source);
  if (result.success) return result.data;
  const names = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
  throw new Error(`Variables de entorno inválidas en ${label}: ${names}`);
}
