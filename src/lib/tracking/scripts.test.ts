import { describe, expect, it } from "vitest";
import { buildTrackingScripts } from "@/lib/tracking/scripts";

const GOOGLE = "G-ABC123XYZ9";
const GTM = "GTM-ABCD123";
const META = "123456789012345";
const TIKTOK = "C1A2B3C4D5E6F7G8H9";

const ids = (scripts: ReturnType<typeof buildTrackingScripts>) => scripts.map((script) => script.id);

describe("buildTrackingScripts", () => {
  it("no devuelve nada sin identificadores", () => {
    expect(buildTrackingScripts({})).toEqual([]);
    expect(buildTrackingScripts({ google: undefined, meta: undefined, tiktok: undefined })).toEqual([]);
    expect(buildTrackingScripts({ google: "", meta: "  ", tiktok: "" })).toEqual([]);
  });

  it("carga la librería y la configuración de una etiqueta de Google", () => {
    const scripts = buildTrackingScripts({ google: GOOGLE });
    expect(ids(scripts)).toEqual(["google-tag-library", "google-tag"]);
    expect(scripts[0]?.src).toBe(`https://www.googletagmanager.com/gtag/js?id=${GOOGLE}`);
    expect(scripts[1]?.code).toContain(`gtag("config","${GOOGLE}")`);
  });

  it("reconoce los prefijos GT y AW como etiqueta de Google", () => {
    for (const google of ["GT-ABCD1234", "AW-123456789"]) {
      expect(ids(buildTrackingScripts({ google }))).toEqual(["google-tag-library", "google-tag"]);
    }
  });

  it("usa el fragmento de Tag Manager con un identificador GTM", () => {
    const scripts = buildTrackingScripts({ google: GTM });
    expect(ids(scripts)).toEqual(["google-tag-manager"]);
    expect(scripts[0]?.code).toContain(`"${GTM}"`);
  });

  it("inicia Meta y TikTok con su identificador", () => {
    const scripts = buildTrackingScripts({ meta: META, tiktok: TIKTOK });
    expect(ids(scripts)).toEqual(["meta-pixel", "tiktok-pixel"]);
    expect(scripts[0]?.code).toContain(`fbq("init","${META}")`);
    expect(scripts[1]?.code).toContain(`ttq.load("${TIKTOK}")`);
  });

  it("devuelve los tres servicios en un orden fijo", () => {
    const scripts = buildTrackingScripts({ tiktok: TIKTOK, meta: META, google: GOOGLE });
    expect(ids(scripts)).toEqual(["google-tag-library", "google-tag", "meta-pixel", "tiktok-pixel"]);
  });

  it("recorta espacios alrededor del identificador", () => {
    expect(ids(buildTrackingScripts({ meta: ` ${META}\n` }))).toEqual(["meta-pixel"]);
  });

  it("descarta identificadores con caracteres que no deben llegar al código", () => {
    const hostile = [`G-ABC");alert(1);//`, "G-ABC 123", "<script>", "GTM-AB'CD", "G-abc12345"];
    for (const google of hostile) expect(buildTrackingScripts({ google })).toEqual([]);
    for (const meta of ["123456789'); alert(1);//", "12345", "abc12345678", `1234567890"`]) {
      expect(buildTrackingScripts({ meta })).toEqual([]);
    }
    for (const tiktok of [`ABC"); alert(1);//`, "short", "abc defghijklm", "<img src=x>"]) {
      expect(buildTrackingScripts({ tiktok })).toEqual([]);
    }
  });

  it("descarta solo el identificador inválido y conserva los demás", () => {
    expect(ids(buildTrackingScripts({ google: "mal formado", meta: META }))).toEqual(["meta-pixel"]);
  });

  it("nunca mezcla `src` y `code` en un mismo script", () => {
    const scripts = buildTrackingScripts({ google: GOOGLE, meta: META, tiktok: TIKTOK });
    for (const script of scripts) expect(Boolean(script.src) !== Boolean(script.code)).toBe(true);
  });
});
