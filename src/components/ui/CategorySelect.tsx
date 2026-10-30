"use client";

import { useRouter } from "next/navigation";
import { ChevronDownIcon } from "@/components/ui/icons";
import type { Category } from "@/lib/constants";

interface CategorySelectProps {
  /** Ruta del formulario sin JavaScript y base del `id` del campo. */
  action: string;
  id: string;
  label: string;
  allLabel: string;
  applyLabel: string;
  /** Cada opción trae el enlace que ya conserva los demás filtros. */
  options: { value: Category; title: string; href: string }[];
  allHref: string;
  selected: Category | undefined;
  /** Filtros que el formulario sin JavaScript debe conservar (región y año). */
  hiddenFields: Record<string, string>;
  className?: string;
}

// Con JavaScript navega al elegir; sin él, el formulario GET con su botón hace lo mismo.
export function CategorySelect({
  action,
  id,
  label,
  allLabel,
  applyLabel,
  options,
  allHref,
  selected,
  hiddenFields,
  className = "",
}: CategorySelectProps) {
  const router = useRouter();

  return (
    <form action={action} method="get" className={`flex items-center gap-4 ${className}`}>
      <label htmlFor={id} className="font-ui text-sm uppercase tracking-caps-wide">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name="category"
          value={selected ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            const href = value === "" ? allHref : options.find((option) => option.value === value)?.href;
            if (href) router.push(href, { scroll: false });
          }}
          className="min-w-48 appearance-none border border-gold bg-bg py-1 pl-4 pr-8 font-body text-base"
        >
          <option value="">{allLabel}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.title}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-accent" />
      </div>
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <noscript>
        <button type="submit" className="border border-gold px-4 py-2">
          {applyLabel}
        </button>
      </noscript>
    </form>
  );
}
