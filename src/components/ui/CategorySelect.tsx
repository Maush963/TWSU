import { Dropdown, type DropdownOption } from "@/components/ui/Dropdown";
import type { Category } from "@/lib/constants";

interface CategorySelectProps {
  id: string;
  label: string;
  allLabel: string;
  /** Cada opción trae el enlace que ya conserva los demás filtros. */
  options: { value: Category; title: string; href: string }[];
  allHref: string;
  selected: Category | undefined;
  /** Pone "All" al final de la lista en vez de al principio. */
  allLast?: boolean;
  /** Etiqueta encima del selector, como en móvil. */
  stacked?: boolean;
  className?: string;
}

export function CategorySelect({
  id,
  label,
  allLabel,
  options,
  allHref,
  selected,
  allLast = false,
  stacked = false,
  className = "",
}: CategorySelectProps) {
  const all: DropdownOption = { value: "", title: allLabel, href: allHref };
  const items: DropdownOption[] = allLast ? [...options, all] : [all, ...options];

  return (
    <div className={`flex ${stacked ? "flex-col items-start gap-1" : "items-center gap-4"} ${className}`}>
      <span id={`${id}-label`} className={`font-ui uppercase tracking-caps-wide ${stacked ? "text-xs" : "text-sm"}`}>
        {label}
      </span>
      <Dropdown
        id={id}
        labelId={`${id}-label`}
        options={items}
        selected={selected ?? ""}
        className={stacked ? "min-w-36" : "min-w-48"}
        buttonClassName="py-1 pl-4 pr-8 text-base"
        optionClassName="text-base"
      />
    </div>
  );
}
