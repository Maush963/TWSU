import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { uiText } from "@/content/ui-text";
import { AtlasMobileList } from "@/components/atlas/AtlasMobileList";
import { AtlasMap } from "@/components/atlas/AtlasMap";
import { AtlasMobileFilters } from "@/components/atlas/AtlasMobileFilters";
import { CategorySelect } from "@/components/ui/CategorySelect";
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
  const activeRegion = parsed.region ?? view.byRegion[0]?.continent;

  // Región y año no tienen control en el diseño, pero siguen funcionando desde la URL.
  const hiddenFields: Record<string, string> = {};
  if (parsed.region) hiddenFields.region = parsed.region;
  if (year !== undefined && year !== years[0]) hiddenFields.year = String(year);

  return (
    <>
      <div className="flex items-center gap-4 px-4 py-4 max-lg:bg-surface lg:flex-wrap lg:items-end lg:justify-between lg:px-0 lg:py-2">
        <div className="max-lg:w-1/2 max-lg:border-r-2 max-lg:border-gold max-lg:pr-4 max-lg:text-right lg:border-l-2 lg:border-gold lg:pl-4">
          <h1 className="font-display text-2xl uppercase leading-none text-accent lg:text-3xl">{uiText.atlas.title}</h1>
          <p className="mt-2 font-body text-xs uppercase leading-snug max-lg:tracking-normal max-lg:text-balance lg:text-base lg:tracking-caps">{uiText.atlas.tagline}</p>
        </div>
        <AtlasMobileFilters
          regions={links.regions}
          activeRegion={activeRegion}
          categories={links.categories}
          allCategoriesHref={links.allCategoriesHref}
          selectedCategory={filters.category}
          hiddenFields={hiddenFields}
        />
        <CategorySelect
          action="/atlas"
          id="atlas-category"
          label={uiText.atlas.exploreBy}
          allLabel={uiText.atlas.allCategories}
          applyLabel={uiText.atlas.applyFilter}
          options={links.categories.map(({ value, title, href }) => ({ value, title, href }))}
          allHref={links.allCategoriesHref}
          selected={filters.category}
          hiddenFields={hiddenFields}
          className="max-lg:hidden"
        />
      </div>
      {view.isEmpty ? (
        <p className="px-4 py-8 text-muted">
          {uiText.atlas.empty}{" "}
          {links.hasActiveFilters && (
            <Link href={links.clearHref} className="text-accent underline">
              {uiText.atlas.clearFilters}
            </Link>
          )}
        </p>
      ) : (
        <>
          <AtlasMap pins={view.positioned} year={year} />
          <AtlasMobileList groups={view.byRegion} activeRegion={activeRegion} />
        </>
      )}
    </>
  );
}

export default function AtlasPage({ searchParams }: PageProps<"/atlas">) {
  return (
    <main className="atlas-page flex min-h-0 flex-1 flex-col lg:px-8 lg:pb-4">
      <Suspense>
        <AtlasContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
