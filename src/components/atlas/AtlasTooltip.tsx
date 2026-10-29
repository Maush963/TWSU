import Image from "next/image";
import { uiText } from "@/content/ui-text";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getKeyStates } from "@/lib/atlas/keys";
import type { PositionedPin } from "@/lib/atlas/collisions";
import { urlFor } from "@/lib/sanity/image";
import { CategoryKeys } from "./CategoryKeys";

// Contenido de la tarjeta flotante (TooltipCard). Solo se monta cuando la tarjeta se abre,
// así la miniatura no se descarga hasta que alguien la ve.
export function AtlasTooltip({ pin }: { pin: PositionedPin }) {
  const keys = getKeyStates(pin.categories);

  return (
    <div className="text-left font-body text-base font-normal normal-case tracking-normal">
      <div className="flex gap-4">
        <div className="size-thumb shrink-0 bg-placeholder">
          {pin.cover && (
            <Image
              src={urlFor(pin.cover).width(240).height(240).fit("crop").url()}
              alt=""
              width={120}
              height={120}
              className="size-thumb object-cover"
            />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="font-display text-lg uppercase leading-tight text-accent">{pin.title}</p>
          <p className="line-clamp-3 text-sm">{pin.excerpt}</p>
          <p className="mt-auto flex items-center gap-2 self-end border-b border-gold text-sm text-accent">
            {uiText.atlas.readMore}
            <ArrowRightIcon className="size-4" />
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-gold-soft pt-4">
        <CategoryKeys states={keys} />
        <p className="text-right text-xs uppercase tracking-caps text-muted">
          {keys
            .filter((key) => key.active)
            .map((key) => key.title)
            .join(" · ")}
        </p>
      </div>
    </div>
  );
}
