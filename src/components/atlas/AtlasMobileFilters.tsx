import { uiText } from "@/content/ui-text";
import { Dropdown } from "@/components/ui/Dropdown";
import type { FilterLink } from "@/lib/atlas/filter-links";
import type { Category, Continent } from "@/lib/constants";

interface AtlasMobileFiltersProps {
  regions: FilterLink<Continent>[];
  activeRegion: Continent | undefined;
  categories: FilterLink<Category>[];
  allCategoriesHref: string;
  selectedCategory: Category | undefined;
}

const LABEL_CLASS = "justify-self-end whitespace-nowrap text-right font-body text-[10px] uppercase";
const BUTTON_CLASS = "py-1 pl-2 pr-6 text-xs";

// Dos selectores apilados: región y categoría. Usan el mismo menú propio que escritorio, así
// se ven igual en todos los dispositivos. "All" va al final de la lista de categorías.
export function AtlasMobileFilters({
  regions,
  activeRegion,
  categories,
  allCategoriesHref,
  selectedCategory,
}: AtlasMobileFiltersProps) {
  return (
    <div className="grid flex-none grid-cols-[auto_auto] items-center gap-x-4 gap-y-2 lg:hidden">
      <span id="atlas-region-label" className={LABEL_CLASS}>
        {uiText.atlas.mobile.explore}
      </span>
      <Dropdown
        id="atlas-region"
        labelId="atlas-region-label"
        options={regions}
        selected={activeRegion}
        className="w-28"
        buttonClassName={BUTTON_CLASS}
        optionClassName="text-xs"
      />
      <span id="atlas-category-mobile-label" className={LABEL_CLASS}>
        {uiText.atlas.mobile.byBest}
      </span>
      <Dropdown
        id="atlas-category-mobile"
        labelId="atlas-category-mobile-label"
        options={[...categories, { value: "", title: uiText.atlas.allCategories, href: allCategoriesHref }]}
        selected={selectedCategory ?? ""}
        className="w-28"
        buttonClassName={BUTTON_CLASS}
        optionClassName="text-xs"
      />
    </div>
  );
}
