import { describe, expect, it } from "vitest";
import { getStandaloneVideo, parseVideoUrl } from "./video";

const ID = "xWfNhWn88Bc";
const YOUTUBE_EMBED = `https://www.youtube-nocookie.com/embed/${ID}`;

describe("parseVideoUrl", () => {
  it("reconoce las formas de enlace de YouTube", () => {
    for (const url of [
      `https://youtu.be/${ID}`,
      `https://youtu.be/${ID}?si=abc`,
      `https://www.youtube.com/watch?v=${ID}`,
      `https://www.youtube.com/watch?v=${ID}&t=30s`,
      `https://m.youtube.com/watch?v=${ID}`,
      `https://www.youtube.com/embed/${ID}`,
      `https://www.youtube.com/shorts/${ID}`,
    ]) {
      expect(parseVideoUrl(url), url).toEqual({ provider: "youtube", id: ID, embedUrl: YOUTUBE_EMBED });
    }
  });

  it("reconoce Vimeo", () => {
    const expected = { provider: "vimeo", id: "123456", embedUrl: "https://player.vimeo.com/video/123456" };
    expect(parseVideoUrl("https://vimeo.com/123456")).toEqual(expected);
    expect(parseVideoUrl("https://player.vimeo.com/video/123456")).toEqual(expected);
  });

  it("ignora espacios alrededor", () => {
    expect(parseVideoUrl(`  https://youtu.be/${ID}  `)?.id).toBe(ID);
  });

  it("rechaza otros dominios, incluso con parecido", () => {
    expect(parseVideoUrl(`https://evil.com/watch?v=${ID}`)).toBeNull();
    expect(parseVideoUrl(`https://youtube.com.evil.com/watch?v=${ID}`)).toBeNull();
    expect(parseVideoUrl(`https://notyoutu.be/${ID}`)).toBeNull();
  });

  it("rechaza ids inválidos, rutas sin video y protocolos raros", () => {
    expect(parseVideoUrl("https://youtu.be/corto")).toBeNull();
    expect(parseVideoUrl("https://www.youtube.com/watch")).toBeNull();
    expect(parseVideoUrl("https://www.youtube.com/channel/abc")).toBeNull();
    expect(parseVideoUrl("https://vimeo.com/channels/staffpicks")).toBeNull();
    expect(parseVideoUrl(`javascript:alert("${ID}")`)).toBeNull();
    expect(parseVideoUrl("")).toBeNull();
    expect(parseVideoUrl("no es un enlace")).toBeNull();
  });
});

function paragraph(...texts: string[]) {
  return { _type: "block", style: "normal", children: texts.map((text) => ({ _type: "span", text })) };
}

describe("getStandaloneVideo", () => {
  it("un párrafo que es solo el enlace es un video", () => {
    expect(getStandaloneVideo(paragraph(`https://youtu.be/${ID}`))?.id).toBe(ID);
  });

  it("junta los fragmentos del párrafo", () => {
    expect(getStandaloneVideo(paragraph("https://youtu.be/", ID))?.id).toBe(ID);
  });

  it("un enlace dentro de una frase no cuenta", () => {
    expect(getStandaloneVideo(paragraph(`Mira esto https://youtu.be/${ID}`))).toBeNull();
  });

  it("un enlace que no es de video o un título no cuentan", () => {
    expect(getStandaloneVideo(paragraph("https://example.com/algo"))).toBeNull();
    expect(getStandaloneVideo({ ...paragraph(`https://youtu.be/${ID}`), style: "h2" })).toBeNull();
  });

  it("bloques vacíos o que no son texto devuelven null", () => {
    expect(getStandaloneVideo({ _type: "block", children: [] })).toBeNull();
    expect(getStandaloneVideo({ _type: "image" })).toBeNull();
  });
});
