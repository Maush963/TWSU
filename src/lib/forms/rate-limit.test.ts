import { describe, expect, it } from "vitest";
import { checkRateLimit, createRateLimiter, EMPTY_RATE_LIMIT_STATE } from "@/lib/forms/rate-limit";

const OPTIONS = { max: 3, windowMs: 1000 };

function run(attempts: { key: string; at: number }[]) {
  let state = EMPTY_RATE_LIMIT_STATE;
  return attempts.map(({ key, at }) => {
    const result = checkRateLimit(state, key, at, OPTIONS);
    state = result.state;
    return result.allowed;
  });
}

describe("checkRateLimit", () => {
  it("permite hasta el máximo y bloquea el siguiente", () => {
    expect(run([0, 1, 2, 3].map((at) => ({ key: "ip", at })))).toEqual([true, true, true, false]);
  });

  it("reinicia la cuenta cuando termina la ventana", () => {
    const attempts = [0, 1, 2, 3, 1000].map((at) => ({ key: "ip", at }));
    expect(run(attempts)).toEqual([true, true, true, false, true]);
  });

  it("no extiende la ventana con los intentos bloqueados", () => {
    const attempts = [0, 999, 999, 999, 1000].map((at) => ({ key: "ip", at }));
    expect(run(attempts)).toEqual([true, true, true, false, true]);
  });

  it("lleva la cuenta de cada clave por separado", () => {
    const attempts = [
      { key: "a", at: 0 },
      { key: "a", at: 1 },
      { key: "a", at: 2 },
      { key: "a", at: 3 },
      { key: "b", at: 4 },
    ];
    expect(run(attempts)).toEqual([true, true, true, false, true]);
  });

  it("no modifica el estado anterior", () => {
    const first = checkRateLimit(EMPTY_RATE_LIMIT_STATE, "ip", 0, OPTIONS);
    checkRateLimit(first.state, "ip", 1, OPTIONS);
    expect(first.state.get("ip")?.count).toBe(1);
    expect(EMPTY_RATE_LIMIT_STATE.size).toBe(0);
  });

  it("descarta las ventanas vencidas", () => {
    const first = checkRateLimit(EMPTY_RATE_LIMIT_STATE, "viejo", 0, OPTIONS);
    const second = checkRateLimit(first.state, "nuevo", 5000, OPTIONS);
    expect([...second.state.keys()]).toEqual(["nuevo"]);
  });
});

describe("createRateLimiter", () => {
  it("guarda la cuenta entre llamadas y usa el reloj recibido", () => {
    let now = 0;
    const limiter = createRateLimiter(OPTIONS, () => now);
    const results = [limiter.allow("ip"), limiter.allow("ip"), limiter.allow("ip"), limiter.allow("ip")];
    expect(results).toEqual([true, true, true, false]);
    now = 1000;
    expect(limiter.allow("ip")).toBe(true);
  });
});
