import Image from "next/image";
import Link from "next/link";
import { uiText } from "@/content/ui-text";
import { ArrowRightIcon } from "@/components/ui/icons";
import { urlFor } from "@/lib/sanity/image";
import type { AtlasRegionGroup } from "@/lib/atlas/view-model";
import type { Continent } from "@/lib/constants";
import { AtlasGlobe } from "./AtlasGlobe";

interface AtlasMobileListProps {
  groups: AtlasRegionGroup[];
  activeRegion: Continent | undefined;
}

// En pantallas chicas el mapa se sustituye por la lista de casos de la región elegida, sobre el
// panel con rejilla, y el globo de la región al pie. Cada caso enlaza al artículo.
export function AtlasMobileList({ groups, activeRegion }: AtlasMobileListProps) {
  const pins = groups.find((group) => group.continent === activeRegion)?.pins ?? [];

  return (
    <div className="atlas-mobile flex flex-1 flex-col lg:hidden">
      <div className="atlas-grid atlas-mobile-list flex-1 p-2">
        {pins.length === 0 ? (
          <p className="p-4 text-muted">{uiText.atlas.empty}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {pins.map((pin) => (
              <li key={pin.id}>
                <Link
                  href={`/perspectives/${pin.slug}`}
                  className="flex gap-4 bg-surface p-2 shadow-sm ring-1 ring-gold-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="block aspect-square w-2/5 shrink-0 bg-placeholder">
                    {pin.cover && (
                      <Image
                        src={urlFor(pin.cover).width(320).height(320).fit("crop").url()}
                        alt=""
                        width={160}
                        height={160}
                        className="size-full object-cover"
                      />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-2">
                    <span className="font-display text-xl uppercase leading-tight text-accent">{pin.title}</span>
                    <span className="line-clamp-4 font-body">{pin.excerpt}</span>
                    <span className="mt-auto flex items-center gap-2 self-end border-b border-gold text-sm text-accent">
                      {uiText.atlas.readMore}
                      <ArrowRightIcon className="size-4" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {activeRegion && <AtlasGlobe region={activeRegion} />}
    </div>
  );
}
