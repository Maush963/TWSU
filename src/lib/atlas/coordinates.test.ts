import { describe, expect, it } from "vitest";
import { formatCoordinates } from "./coordinates";

describe("formatCoordinates", () => {
  it("usa N y W para México", () => {
    expect(formatCoordinates(20.2114, -87.4654)).toBe("20.2114° N. 87.4654° W");
  });

  it("usa S y E para el hemisferio sur y oriental", () => {
    expect(formatCoordinates(-33.9, 151.2)).toBe("33.9000° S. 151.2000° E");
  });
});
