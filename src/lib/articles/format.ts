/** Fecha larga sin hora, en UTC para que no cambie de día según la zona del servidor. */
export function formatArticleDate(isoDate: string, locale: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(date);
}
