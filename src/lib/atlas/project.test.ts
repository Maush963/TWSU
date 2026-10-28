import { describe, expect, it } from "vitest";
import { DEFAULT_MAP_CONFIG, project, type MapConfig } from "@/lib/atlas/project";

describe("project, equirectangular", () => {
  it("(0,0) cae en el centro", () => {
    const { x, y } = project(0, 0, DEFAULT_MAP_CONFIG);
    expect(x).toBeCloseTo(50);
    expect(y).toBeCloseTo(50);
  });

  it("las esquinas dan 0 y 100", () => {
    const topLeft = project(90, -180, DEFAULT_MAP_CONFIG);
    const bottomRight = project(-90, 180, DEFAULT_MAP_CONFIG);
    expect(topLeft.x).toBeCloseTo(0);
    expect(topLeft.y).toBeCloseTo(0);
    expect(bottomRight.x).toBeCloseTo(100);
    expect(bottomRight.y).toBeCloseTo(100);
  });
});

describe("project, mercator", () => {
  const mercator: MapConfig = {
    projection: "mercator",
    bounds: { west: -180, east: 180, north: 80, south: -80 },
  };

  it("el ecuador cae a la mitad de la altura", () => {
    expect(project(0, 0, mercator).y).toBeCloseTo(50);
  });

  it("es simétrico respecto al ecuador", () => {
    for (const lat of [10, 35, 60, 78]) {
      expect(project(lat, 0, mercator).y + project(-lat, 0, mercator).y).toBeCloseTo(100);
    }
  });
});
