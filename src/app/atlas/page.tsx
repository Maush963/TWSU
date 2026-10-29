import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { uiText } from "@/content/ui-text";
import { AtlasMap } from "@/components/atlas/AtlasMap";
import { CategorySelect } from "@/components/atlas/CategorySelect";
import { resolveAtlasYear } from "@/lib/atlas/filter-links";
import { buildAtlasView } from "@/lib/atlas/view-model";
import { getAtlasPins, getAtlasYears } from "@/lib/data/atlas";
import { parseAtlasFilters } from "@/lib/filters";

export const metadata: Metadata = { title: uiText.atlas.title };

async function AtlasContent({ searchParams }: { searchParams: PageProps<"/atlas">["searchParams"] }) {
  const parsed = parseAtlasFilters(await searchParams);
  const years = await getAtlasYears();
  const year = resolveAtlasYear(parsed.year, years);
  const filters = { ...parsed, ...(year !== undefined ? { year } : {}) };
  const view = buildAtlasView(await getAtlasPins(filters), filters, years);
  const { links } = view;

  // Región y año no tienen control en el diseño, pero siguen funcionando desde la URL.
  const hiddenFields: Record<string, string> = {};
  if (parsed.region) hiddenFields.region = parsed.region;
  if (year !== undefined && year !== years[0]) hiddenFields.year = String(year);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 py-2">
        <div className="border-l-2 border-gold pl-4">
          <h1 className="font-display text-3xl uppercase leading-none text-accent">{uiText.atlas.title}</h1>
          <p className="mt-2 font-body uppercase tracking-caps">{uiText.atlas.tagline}</p>
        </div>
        <CategorySelect
          label={uiText.atlas.exploreBy}
          allLabel={uiText.atlas.allCategories}
          applyLabel={uiText.atlas.applyFilter}
          options={links.categories.map(({ value, title, href }) => ({ value, title, href }))}
          allHref={links.allCategoriesHref}
          selected={filters.category}
          hiddenFields={hiddenFields}
        />
      </div>
      {view.isEmpty ? (
        <p className="py-8 text-muted">
          {uiText.atlas.empty}{" "}
          {links.hasActiveFilters && (
            <Link href={links.clearHref} className="text-accent underline">
              {uiText.atlas.clearFilters}
            </Link>
          )}
        </p>
      ) : (
        <AtlasMap pins={view.positioned} year={year} />
      )}
    </>
  );
}

export default function AtlasPage({ searchParams }: PageProps<"/atlas">) {
  return (
    <main className="atlas-page flex min-h-0 flex-1 flex-col px-8 pb-4">
      <Suspense>
        <AtlasContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
