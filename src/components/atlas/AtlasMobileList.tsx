import Link from "next/link";
import { uiText } from "@/content/ui-text";
import type { AtlasRegionGroup } from "@/lib/atlas/view-model";
import type { FilterLink } from "@/lib/atlas/filter-links";
import type { Continent } from "@/lib/constants";
import { AtlasTooltip } from "./AtlasTooltip";

interface AtlasMobileListProps {
  regions: FilterLink<Continent>[];
  groups: AtlasRegionGroup[];
  activeRegion: Continent | undefined;
}

// En pantallas chicas el mapa se sustituye por un selector de región y la lista de casos de la
// región elegida. Cada caso muestra lo mismo que el tooltip del escritorio y enlaza al artículo.
export function AtlasMobileList({ regions, groups, activeRegion }: AtlasMobileListProps) {
  const pins = groups.find((group) => group.continent === activeRegion)?.pins ?? [];

  return (
    <div className="flex flex-col gap-4 lg:hidden">
      <nav aria-label={uiText.atlas.filters.region}>
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {regions.map(({ value, title, href }) => {
            const active = value === activeRegion;
            return (
              <li key={value} className="shrink-0">
                {active ? (
                  <span
                    aria-current="true"
                    className="block border border-accent bg-accent px-4 py-2 font-ui text-sm uppercase tracking-caps text-surface"
                  >
                    {title}
                  </span>
                ) : (
                  <Link
                    href={href}
                    scroll={false}
                    className="block border border-gold px-4 py-2 font-ui text-sm uppercase tracking-caps text-accent"
                  >
                    {title}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      {pins.length === 0 ? (
        <p className="py-4 text-muted">{uiText.atlas.empty}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {pins.map((pin) => (
            <li key={pin.id}>
              <Link
                href={`/perspectives/${pin.slug}`}
                className="block bg-surface p-4 ring-1 ring-gold-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className="mb-2 block text-xs uppercase tracking-caps text-muted">{pin.placeName}</span>
                <AtlasTooltip pin={pin} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
