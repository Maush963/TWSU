const UNKNOWN_CLIENT = "unknown";

/** Clave del cliente para el límite: la primera IP de `x-forwarded-for`, que pone la plataforma. */
export function getClientKey(headers: Pick<Headers, "get">): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  return headers.get("x-real-ip")?.trim() || UNKNOWN_CLIENT;
}
