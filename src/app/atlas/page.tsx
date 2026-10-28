import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { uiText } from "@/content/ui-text";
import { AtlasMap } from "@/components/atlas/AtlasMap";
import { resolveAtlasYear, type FilterLink } from "@/lib/atlas/filter-links";
import { buildAtlasView } from "@/lib/atlas/view-model";
import { getAtlasPins, getAtlasYears } from "@/lib/data/atlas";
import { parseAtlasFilters } from "@/lib/filters";

export const metadata: Metadata = { title: uiText.atlas.title };

function FilterGroup<T extends string | number>({ label, links }: { label: string; links: FilterLink<T>[] }) {
  if (links.length === 0) return null;
  return (
    <li>
      <span className="text-muted">{label}: </span>
      {links.map((link) => (
        <Link
          key={link.value}
          href={link.href}
          aria-current={link.active ? "true" : undefined}
          className={link.active ? "font-bold mr-2" : "mr-2"}
        >
          {link.title}
        </Link>
      ))}
    </li>
  );
}

// Temporal: mapa básico con puntos. Tooltip, llaves, móvil y diseño son de la Parte B.
async function AtlasPoints({ searchParams }: { searchParams: PageProps<"/atlas">["searchParams"] }) {
  const parsed = parseAtlasFilters(await searchParams);
  const years = await getAtlasYears();
  const year = resolveAtlasYear(parsed.year, years);
  const filters = { ...parsed, ...(year !== undefined ? { year } : {}) };
  const view = buildAtlasView(await getAtlasPins(filters), filters, years);
  const { links } = view;

  return (
    <>
      <ul aria-label={uiText.atlas.filters.label}>
        <FilterGroup label={uiText.atlas.filters.category} links={links.categories} />
        <FilterGroup label={uiText.atlas.filters.region} links={links.regions} />
        <FilterGroup label={uiText.atlas.filters.year} links={links.years} />
        {links.hasActiveFilters && (
          <li>
            <Link href={links.clearHref}>{uiText.atlas.filters.clear}</Link>
          </li>
        )}
      </ul>
      {view.isEmpty ? <p className="text-muted">{uiText.atlas.empty}</p> : <AtlasMap pins={view.positioned} />}
    </>
  );
}

export default function AtlasPage({ searchParams }: PageProps<"/atlas">) {
  return (
    <main className="p-4">
      <h1 className="font-display text-2xl">{uiText.atlas.title}</h1>
      <Suspense>
        <AtlasPoints searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
