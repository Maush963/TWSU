import { MAIL_TIMEOUT_MS } from "@/lib/constants";
import type { FetchLike, MailResult } from "./types";

interface MailRequest {
  url: string;
  init: RequestInit;
  /** Respuestas no exitosas que igual cuentan como éxito (correo que ya existe). */
  isAlreadyRegistered: (body: unknown) => boolean;
}

/** Una sola llamada, con tiempo máximo y sin reintentos que dupliquen el envío. */
export async function sendMailRequest(
  fetchImpl: FetchLike,
  { url, init, isAlreadyRegistered }: MailRequest,
): Promise<MailResult> {
  try {
    const response = await fetchImpl(url, { ...init, signal: AbortSignal.timeout(MAIL_TIMEOUT_MS) });
    if (response.ok) return { ok: true };
    const body: unknown = await response.json().catch(() => null);
    if (isAlreadyRegistered(body)) return { ok: true };
    return { ok: false, reason: response.status >= 500 ? "unavailable" : "rejected" };
  } catch (error) {
    const timedOut = error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError");
    return { ok: false, reason: timedOut ? "timeout" : "unavailable" };
  }
}

export function readField(body: unknown, name: string): unknown {
  return typeof body === "object" && body !== null ? (body as Record<string, unknown>)[name] : undefined;
}
