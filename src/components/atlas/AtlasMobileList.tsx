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
                  className="flex gap-4 bg-surface p-2 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
                  <span className="fit-column fit-column-list flex min-w-0 flex-1 flex-col gap-1 pt-3">
                    <span className={`fit-clamp [--fit-lines:4] shrink-0 font-display uppercase leading-tight text-accent text-base`}>{pin.title}</span>
                    <span className="fit-clamp fit-clamp-text shrink-0 font-body">{pin.excerpt}</span>
                    <span className="mt-auto flex shrink-0 items-center gap-2 self-end border-b border-gold text-sm text-accent">
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
