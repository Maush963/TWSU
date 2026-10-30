import { MIN_FILL_MS } from "@/lib/constants";

export interface SpamSignals {
  /** Campo trampa: las personas no lo ven, así que debe llegar vacío. */
  website?: string | null | undefined;
  /** Momento (ms) en que se mostró el formulario. */
  startedAt?: number | undefined;
}

/** Un envío es sospechoso si llenó el campo trampa o llegó antes de lo que una persona tarda. */
export function isSpam({ website, startedAt }: SpamSignals, now: number): boolean {
  if (website !== undefined && website !== null && website.trim() !== "") return true;
  if (typeof startedAt !== "number" || !Number.isFinite(startedAt)) return true;
  const elapsed = now - startedAt;
  return elapsed < MIN_FILL_MS;
}
