"use client";

import { useRouter } from "next/navigation";
import { uiText } from "@/content/ui-text";
import { ChevronDownIcon } from "@/components/ui/icons";
import type { FilterLink } from "@/lib/atlas/filter-links";
import type { Category, Continent } from "@/lib/constants";

interface AtlasMobileFiltersProps {
  regions: FilterLink<Continent>[];
  activeRegion: Continent | undefined;
  categories: FilterLink<Category>[];
  allCategoriesHref: string;
  selectedCategory: Category | undefined;
  /** Filtros que el formulario sin JavaScript debe conservar (el año). */
  hiddenFields: Record<string, string>;
}

const SELECT_CLASS = "w-full appearance-none border border-gold bg-bg py-1 pl-2 pr-6 font-body text-sm";
const LABEL_CLASS = "w-16 shrink-0 text-right font-body text-xs uppercase tracking-caps";
const CHEVRON_CLASS = "pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-accent";

// Dos selectores apilados: región y categoría. Cada opción trae el enlace que ya conserva los
// demás filtros. Sin JavaScript, el formulario GET con su botón hace lo mismo.
export function AtlasMobileFilters({
  regions,
  activeRegion,
  categories,
  allCategoriesHref,
  selectedCategory,
  hiddenFields,
}: AtlasMobileFiltersProps) {
  const router = useRouter();
  const go = (href: string | undefined) => {
    if (href) router.push(href, { scroll: false });
  };

  return (
    <form action="/atlas" method="get" className="flex flex-1 flex-col gap-2 lg:hidden">
      <div className="flex items-center gap-2">
        <label htmlFor="atlas-region" className={LABEL_CLASS}>
          {uiText.atlas.mobile.explore}
        </label>
        <div className="relative flex-1">
          <select
            id="atlas-region"
            name="region"
            value={activeRegion ?? ""}
            onChange={(event) => go(regions.find((region) => region.value === event.target.value)?.href)}
            className={SELECT_CLASS}
          >
            {regions.map((region) => (
              <option key={region.value} value={region.value}>
                {region.title}
              </option>
            ))}
          </select>
          <ChevronDownIcon className={CHEVRON_CLASS} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="atlas-category-mobile" className={LABEL_CLASS}>
          {uiText.atlas.mobile.byBest}
        </label>
        <div className="relative flex-1">
          <select
            id="atlas-category-mobile"
            name="category"
            value={selectedCategory ?? ""}
            onChange={(event) =>
              go(
                event.target.value === ""
                  ? allCategoriesHref
                  : categories.find((category) => category.value === event.target.value)?.href,
              )
            }
            className={SELECT_CLASS}
          >
            <option value="">{uiText.atlas.allCategories}</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.title}
              </option>
            ))}
          </select>
          <ChevronDownIcon className={CHEVRON_CLASS} />
        </div>
      </div>
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <noscript>
        <button type="submit" className="border border-gold px-4 py-2">
          {uiText.atlas.applyFilter}
        </button>
      </noscript>
    </form>
  );
}
