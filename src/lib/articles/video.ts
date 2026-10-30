// Sin imports de Next ni de React: Sanity Studio también lo usa para validar el enlace.

export interface VideoEmbedData {
  provider: "youtube" | "vimeo";
  id: string;
  /** Dirección del reproductor incrustable. YouTube va por el dominio sin cookies. */
  embedUrl: string;
}

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d+$/;

function youtube(id: string | undefined | null): VideoEmbedData | null {
  if (!id || !YOUTUBE_ID.test(id)) return null;
  return { provider: "youtube", id, embedUrl: `https://www.youtube-nocookie.com/embed/${id}` };
}

function vimeo(id: string | undefined | null): VideoEmbedData | null {
  if (!id || !VIMEO_ID.test(id)) return null;
  return { provider: "vimeo", id, embedUrl: `https://player.vimeo.com/video/${id}` };
}

/**
 * Reconoce enlaces de YouTube (`watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`) y de Vimeo
 * (`vimeo.com/<id>`). Solo acepta esos dominios; cualquier otro enlace devuelve null.
 */
export function parseVideoUrl(input: string): VideoEmbedData | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") return youtube(parts[0]);
  if (YOUTUBE_HOSTS.has(host)) {
    if (parts[0] === "watch") return youtube(url.searchParams.get("v"));
    if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") return youtube(parts[1]);
    return null;
  }
  if (VIMEO_HOSTS.has(host)) {
    // vimeo.com/<id> y player.vimeo.com/video/<id>
    return vimeo(parts[0] === "video" ? parts[1] : parts[0]);
  }
  return null;
}

interface TextBlockLike {
  _type?: string;
  style?: string;
  children?: { _type?: string; text?: string }[];
}

/**
 * Si el párrafo es solo un enlace de video (lo que pasa al pegar la URL en su propia línea),
 * devuelve el video. Un enlace dentro de una frase no cuenta.
 */
export function getStandaloneVideo(block: TextBlockLike): VideoEmbedData | null {
  if (block._type !== "block" || (block.style ?? "normal") !== "normal") return null;
  const children = block.children ?? [];
  if (children.length === 0 || children.some((child) => child._type !== "span")) return null;
  const text = children.map((child) => child.text ?? "").join("").trim();
  if (!text || /\s/.test(text)) return null;
  return parseVideoUrl(text);
}
