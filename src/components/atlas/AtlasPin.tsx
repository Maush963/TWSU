import Link from "next/link";
import type { PositionedPin } from "@/lib/atlas/collisions";

// Un punto es un enlace al artículo, posicionado en porcentaje sobre el mapa.
export function AtlasPin({ pin }: { pin: PositionedPin }) {
  const label = `${pin.title}, ${pin.placeName}`;
  return (
    <Link
      href={`/perspectives/${pin.slug}`}
      title={label}
      className="absolute size-pin -translate-x-1/2 -translate-y-1/2 rounded-full border border-bg bg-accent focus-visible:outline-2 focus-visible:outline-text"
      style={{ left: `${pin.displayX}%`, top: `${pin.displayY}%` }}
    >
      <span className="sr-only">{label}</span>
    </Link>
  );
}
