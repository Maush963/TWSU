/** Coordenadas como en el diseño: "20.2114° N. 87.4654° W". */
export function formatCoordinates(lat: number, lng: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${ns}. ${Math.abs(lng).toFixed(4)}° ${ew}`;
}
