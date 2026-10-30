export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Las referencias de imagen de Sanity traen el tamaño original: `image-<id>-<ancho>x<alto>-<ext>`.
 * Sirve para reservar el espacio de la imagen sin saltos de diseño. Devuelve null si no coincide.
 */
export function parseImageRef(ref: string): ImageDimensions | null {
  const match = /^image-[A-Za-z0-9]+-(\d+)x(\d+)-[a-z0-9]+$/.exec(ref);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  return width > 0 && height > 0 ? { width, height } : null;
}
