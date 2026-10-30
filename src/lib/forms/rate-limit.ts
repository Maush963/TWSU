import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "@/lib/constants";

export interface RateLimitOptions {
  max: number;
  windowMs: number;
}

interface Window {
  count: number;
  resetAt: number;
}

export type RateLimitState = ReadonlyMap<string, Window>;

export const EMPTY_RATE_LIMIT_STATE: RateLimitState = new Map();

const DEFAULT_OPTIONS: RateLimitOptions = { max: RATE_LIMIT_MAX, windowMs: RATE_LIMIT_WINDOW_MS };

/**
 * Cuenta un intento de `key` en una ventana fija. Devuelve el estado nuevo sin tocar el anterior,
 * y descarta las ventanas vencidas para que el estado no crezca sin fin.
 */
export function checkRateLimit(
  state: RateLimitState,
  key: string,
  now: number,
  options: RateLimitOptions = DEFAULT_OPTIONS,
): { allowed: boolean; state: RateLimitState } {
  const next = new Map<string, Window>();
  for (const [stored, window] of state) {
    if (window.resetAt > now) next.set(stored, window);
  }
  const window = next.get(key) ?? { count: 0, resetAt: now + options.windowMs };
  const allowed = window.count < options.max;
  next.set(key, allowed ? { ...window, count: window.count + 1 } : window);
  return { allowed, state: next };
}

export interface RateLimiter {
  /** `true` si el intento cabe en el límite. */
  allow(key: string): boolean;
}

// El contador vive en la memoria de esta instancia: con varias instancias (Vercel) no se comparte.
// Para compartirlo basta cambiar este almacén; `checkRateLimit` no cambia.
export function createRateLimiter(
  options: RateLimitOptions = DEFAULT_OPTIONS,
  clock: () => number = Date.now,
): RateLimiter {
  let state = EMPTY_RATE_LIMIT_STATE;
  return {
    allow(key) {
      const result = checkRateLimit(state, key, clock(), options);
      state = result.state;
      return result.allowed;
    },
  };
}
