export interface ShareLinks {
  facebook: string;
  x: string;
  linkedin: string;
}

/** Enlaces para compartir un artículo. `url` debe ser absoluta; todo se codifica para la URL. */
export function buildShareLinks(url: string, title: string): ShareLinks {
  const target = encodeURIComponent(url);
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${target}`,
    x: `https://twitter.com/intent/tweet?url=${target}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${target}`,
  };
}
