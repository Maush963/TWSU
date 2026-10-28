import Image from "next/image";
import { uiText } from "@/content/ui-text";
import type { PositionedPin } from "@/lib/atlas/collisions";
import { ATLAS_MAP_IMAGE } from "@/lib/atlas/map-config";
import { AtlasPin } from "./AtlasPin";

// El contenedor tiene la proporción de la imagen, así mapa y puntos escalan juntos.
export function AtlasMap({ pins }: { pins: PositionedPin[] }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: `${ATLAS_MAP_IMAGE.width} / ${ATLAS_MAP_IMAGE.height}` }}>
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
    </div>
  );
}
