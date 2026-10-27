import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseEnv } from "@/lib/parse-env";

describe("parseEnv", () => {
  const schema = z.object({ A: z.string().min(1) });

  it("devuelve los valores válidos", () => {
    expect(parseEnv(schema, { A: "x" }, "t")).toEqual({ A: "x" });
  });

  it("nombra la variable que falta", () => {
    expect(() => parseEnv(schema, {}, "t")).toThrow(/A/);
  });
});
