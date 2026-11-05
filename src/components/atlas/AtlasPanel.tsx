import Image from "next/image";
import Link from "next/link";
import { uiText } from "@/content/ui-text";
import { ArrowRightIcon } from "@/components/ui/icons";
import { formatCoordinates } from "@/lib/atlas/coordinates";
import { getKeyStates } from "@/lib/atlas/keys";
import { urlFor } from "@/lib/sanity/image";
import type { AtlasPinData } from "@/lib/sanity/types";
import { CategoryKeys } from "./CategoryKeys";

// Panel derecho del Atlas: muestra el caso del punto seleccionado (reemplaza al tooltip flotante).
// `aria-live` anuncia el cambio cuando se elige otro punto.
export function AtlasPanel({ pin }: { pin: AtlasPinData }) {
  const keys = getKeyStates(pin.categories);
  const active = keys.filter((key) => key.active);

  return (
    <aside
      aria-label={uiText.atlas.panelLabel}
      aria-live="polite"
      className="flex w-panel shrink-0 flex-col gap-4 overflow-y-auto border-l border-gold-soft px-8 py-2"
    >
      <div>
        <p className="font-body text-xs uppercase tracking-caps text-muted">
          {pin.placeName} {formatCoordinates(pin.lat, pin.lng)}
        </p>
        <h2 className="mt-2 font-display text-2xl uppercase leading-none text-accent">
          {pin.title}
        </h2>
      </div>
      <div className="aspect-video w-full shrink-0 bg-placeholder">
        {pin.cover && (
          <Image
            key={pin.id}
            src={urlFor(pin.cover).width(960).height(540).fit("crop").url()}
            alt=""
            width={480}
            height={270}
            className="size-full object-cover"
          />
        )}
      </div>
      <p className="font-body text-base">{pin.excerpt}</p>
      <Link
        href={`/perspectives/${pin.slug}`}
        className="flex items-center gap-2 self-end border-b border-gold text-accent hover:text-pin"
      >
        {uiText.atlas.readMore}
        <ArrowRightIcon className="size-4" />
      </Link>
      <div className="mt-auto flex items-center gap-4 border-t border-gold-soft pt-4">
        <CategoryKeys states={keys} />
        <p className="text-xs uppercase tracking-caps text-muted">
          {active.map((key) => key.title).join(" · ")}
        </p>
      </div>
    </aside>
  );
}
