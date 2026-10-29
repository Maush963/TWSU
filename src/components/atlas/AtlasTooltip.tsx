import Image from "next/image";
import { uiText } from "@/content/ui-text";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getKeyStates } from "@/lib/atlas/keys";
import type { PositionedPin } from "@/lib/atlas/collisions";
import { urlFor } from "@/lib/sanity/image";
import { CategoryKeys } from "./CategoryKeys";

// Cuando el punto está en la mitad derecha o inferior del mapa, la tarjeta se abre hacia
// el otro lado para no salirse.
const EDGE = 55;

// Se muestra con hover y con foco del enlace del punto, sin JavaScript. Va dentro del enlace,
// así que mantenerse sobre la tarjeta la mantiene abierta y hacer clic lleva al artículo.
export function AtlasTooltip({ pin, descriptionId }: { pin: PositionedPin; descriptionId: string }) {
  const horizontal = pin.displayX > EDGE ? "right-0" : "left-0";
  const vertical = pin.displayY > EDGE ? "bottom-full pb-2" : "top-full pt-2";
  const keys = getKeyStates(pin.categories);

  return (
    <span
      className={`atlas-tooltip absolute z-10 hidden w-tooltip group-focus-within:block group-hover:block ${horizontal} ${vertical}`}
    >
      <span className="block bg-surface p-4 text-left font-body text-base font-normal normal-case tracking-normal text-text shadow-lg">
        <span className="flex gap-4">
          <span className="block size-thumb shrink-0 bg-placeholder">
            {pin.cover && (
              <Image
                src={urlFor(pin.cover).width(240).height(240).fit("crop").url()}
                alt=""
                width={120}
                height={120}
                className="size-thumb object-cover"
              />
            )}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="font-display text-lg uppercase leading-tight text-accent">{pin.title}</span>
            <span id={descriptionId} className="line-clamp-3 text-sm">
              {pin.excerpt}
            </span>
            <span className="mt-auto flex items-center gap-2 self-end border-b border-gold text-sm text-accent">
              {uiText.atlas.readMore}
              <ArrowRightIcon className="size-4" />
            </span>
          </span>
        </span>
        <span className="mt-4 flex items-center justify-between gap-4 border-t border-gold-soft pt-4">
          <CategoryKeys states={keys} />
          <span className="text-right text-xs uppercase tracking-caps text-muted">
            {keys
              .filter((key) => key.active)
              .map((key) => key.title)
              .join(" · ")}
          </span>
        </span>
      </span>
    </span>
  );
}
