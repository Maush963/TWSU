import Image from "next/image";
import { uiText } from "@/content/ui-text";
import { CompassIcon } from "@/components/ui/icons";
import type { PositionedPin } from "@/lib/atlas/collisions";
import { ATLAS_MAP_IMAGE } from "@/lib/atlas/map-config";
import { AtlasPin } from "./AtlasPin";
import { AtlasTooltipDismiss } from "./AtlasTooltipDismiss";

const MAP_ID = "atlas-map";

// El contenedor tiene la proporción de la imagen, así mapa y puntos escalan juntos.
export function AtlasMap({ pins, year }: { pins: PositionedPin[]; year?: number | undefined }) {
  return (
    <section
      id={MAP_ID}
      className="atlas-grid atlas-map relative w-full"
      style={{ aspectRatio: `${ATLAS_MAP_IMAGE.width} / ${ATLAS_MAP_IMAGE.height}` }}
    >
      <Image
        src={ATLAS_MAP_IMAGE.src}
        alt={uiText.atlas.mapAlt}
        width={ATLAS_MAP_IMAGE.width}
        height={ATLAS_MAP_IMAGE.height}
        sizes="100vw"
        priority
        className="h-auto w-full"
      />
      {pins.map((pin) => (
        <AtlasPin key={pin.id} pin={pin} />
      ))}
      <div className="pointer-events-none absolute bottom-4 left-4 flex flex-col items-center gap-2 text-accent">
        <CompassIcon className="size-compass" />
        {year !== undefined && (
          <p className="font-body text-sm">
            {year} {uiText.atlas.edition}
          </p>
        )}
      </div>
      <AtlasTooltipDismiss targetId={MAP_ID} />
    </section>
  );
}
