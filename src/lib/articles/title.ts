/** Largo del título: decide qué tamaño de letra usa cada pieza para que quepa en sus líneas. */
export type TitleLength = "short" | "medium" | "long";

export const TITLE_SHORT_MAX = 28;
export const TITLE_MEDIUM_MAX = 44;

export function titleLength(title: string): TitleLength {
  const size = title.trim().length;
  if (size <= TITLE_SHORT_MAX) return "short";
  if (size <= TITLE_MEDIUM_MAX) return "medium";
  return "long";
}

/** Elige la clase de cada largo. Las clases se escriben completas en cada componente para que Tailwind las vea. */
export function titleSize(title: string, sizes: Record<TitleLength, string>): string {
  return sizes[titleLength(title)];
}
