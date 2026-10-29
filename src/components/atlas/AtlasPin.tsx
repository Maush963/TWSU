import Link from "next/link";
import { TooltipCard } from "@/components/ui/TooltipCard";
import type { PositionedPin } from "@/lib/atlas/collisions";
import { AtlasTooltip } from "./AtlasTooltip";

// Un punto es un enlace al artículo, posicionado en porcentaje sobre el mapa. La tarjeta
// flotante es visual; el nombre y la descripción para lectores de pantalla van en el enlace.
export function AtlasPin({ pin }: { pin: PositionedPin }) {
  const label = `${pin.title}, ${pin.placeName}`;
  const descriptionId = `atlas-pin-${pin.id}`;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 focus-within:z-20 hover:z-20"
      style={{ left: `${pin.displayX}%`, top: `${pin.displayY}%` }}
    >
      <TooltipCard content={<AtlasTooltip pin={pin} />}>
        <Link
          href={`/perspectives/${pin.slug}`}
          aria-label={label}
          aria-describedby={descriptionId}
          className="block size-pin rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-full drop-shadow">
            <circle cx="12" cy="12" r="11.5" className="fill-gold" />
            <circle cx="12" cy="12" r="9" className="fill-pin" />
            <circle cx="12" cy="12" r="4" className="fill-gold" />
            <circle cx="12" cy="12" r="2" className="fill-pin" />
          </svg>
        </Link>
      </TooltipCard>
      <span id={descriptionId} className="sr-only">
        {pin.excerpt}
      </span>
    </div>
  );
}
