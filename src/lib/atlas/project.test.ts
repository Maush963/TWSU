import { describe, expect, it } from "vitest";
import { ATLAS_MAP_IMAGE } from "@/lib/atlas/map-config";
import { DEFAULT_MAP_CONFIG, project, type BoundsMapConfig } from "@/lib/atlas/project";

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

describe("project, calibrado con el PNG del atlas", () => {
  const { width, height } = ATLAS_MAP_IMAGE;

  // Puntos de costa con su píxel medido directamente en public/atlas/mapa.png.
  const landmarks = [
    { name: "cabo Agulhas", lat: -34.83, lng: 20.0, px: 832, py: 760 },
    { name: "norte de Groenlandia", lat: 83.67, lng: -30.7, px: 640, py: 42 },
    { name: "cabo Farewell, Groenlandia", lat: 59.77, lng: -43.9, px: 577, py: 216 },
    { name: "sur de Madagascar", lat: -25.6, lng: 45.2, px: 949, py: 712 },
    { name: "cabo Wilsons, sur de Australia", lat: -39.13, lng: 146.37, px: 1431, py: 798 },
    { name: "oeste de Islandia", lat: 65.5, lng: -24.53, px: 654, py: 181 },
  ];

  // Con la malla de corrección, el margen es del 1.5% del ancho y del alto (unos 25 px).
  it.each(landmarks)("$name cae donde está en el dibujo", ({ lat, lng, px, py }) => {
    const { x, y } = project(lat, lng);
    expect(Math.abs(x - (px / width) * 100)).toBeLessThan(1.5);
    expect(Math.abs(y - (py / height) * 100)).toBeLessThan(1.5);
  });

  it("el norte queda arriba y el este a la derecha", () => {
    expect(project(60, 0).y).toBeLessThan(project(-30, 0).y);
    expect(project(0, 100).x).toBeGreaterThan(project(0, -80).x);
  });

  it("un lugar fuera del dibujo se pega al borde en lugar de salirse", () => {
    const cook = project(-21.2, -159.8); // Islas Cook
    expect(cook.x).toBeGreaterThanOrEqual(0);
    expect(cook.x).toBeLessThanOrEqual(100);
    expect(project(-90, 180).y).toBeLessThanOrEqual(100);
  });

  it("ciudades de referencia caen dentro de la imagen", () => {
    const cities = [
      [19.43, -99.13], // Ciudad de México
      [38.72, -9.14], // Lisboa
      [35.68, 139.69], // Tokio
      [-33.92, 18.42], // Ciudad del Cabo
      [-33.87, 151.21], // Sídney
    ] as const;
    for (const [lat, lng] of cities) {
      const { x, y } = project(lat, lng);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(100);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(100);
    }
  });
});

describe("project, mercator", () => {
  const mercator: BoundsMapConfig = {
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
