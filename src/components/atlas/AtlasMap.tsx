"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { uiText } from "@/content/ui-text";
import { CompassIcon } from "@/components/ui/icons";
import type { PositionedPin } from "@/lib/atlas/collisions";
import { ATLAS_MAP_IMAGE } from "@/lib/atlas/map-config";
import { AtlasPanel } from "./AtlasPanel";
import { AtlasPin } from "./AtlasPin";

const MAP_ID = "atlas-map";

// El panel con rejilla ocupa el espacio disponible; el mapa se ajusta dentro con la proporción de
// la imagen, así mapa y puntos escalan juntos y todo cabe sin hacer scroll (ver atlas.css).
export function AtlasMap({
  pins,
  year,
}: {
  pins: PositionedPin[];
  year?: number | undefined;
}) {
  const ratio = ATLAS_MAP_IMAGE.width / ATLAS_MAP_IMAGE.height;
  const [selectedId, setSelectedId] = useState(pins[0]?.id);
  // Si un filtro quita el punto elegido, se muestra el primero.
  const selected = pins.find((pin) => pin.id === selectedId) ?? pins[0];

  return (
    <div className="flex min-h-0 flex-1 gap-0 max-lg:hidden">
      <div className="atlas-grid atlas-stage relative min-w-0 flex-1">
        <section
          id={MAP_ID}
          className="atlas-map atlas-sheet relative"
          style={
            {
              aspectRatio: String(ratio),
              "--atlas-ratio": ratio,
            } as CSSProperties
          }
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
            <AtlasPin
              key={pin.id}
              pin={pin}
              selected={pin.id === selected?.id}
              onSelect={setSelectedId}
            />
          ))}
        </section>
        <div className="pointer-events-none absolute bottom-4 left-4 flex flex-col items-center gap-2 text-accent">
          <CompassIcon className="size-compass" />
          {year !== undefined && (
            <p className="font-body text-sm">
              {year} {uiText.atlas.edition}
            </p>
          )}
        </div>
      </div>
      {selected && <AtlasPanel pin={selected} />}
    </div>
  );
}
