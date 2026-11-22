"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";

export interface DropdownOption {
  value: string;
  title: string;
  /** Enlace que ya conserva los demás filtros. */
  href: string;
}

interface DropdownProps {
  id: string;
  /** Id del texto que nombra el selector. */
  labelId: string;
  options: DropdownOption[];
  /** Valor activo; si no coincide con ninguna opción se muestra `fallbackTitle`. */
  selected: string | undefined;
  fallbackTitle?: string;
  className?: string;
  /** Clases del botón (tamaño de texto, relleno, ancho). */
  buttonClassName?: string;
  optionClassName?: string;
}

// Selector propio. El `<select>` nativo deja el menú desplegado en manos del sistema operativo
// (en Mac e iOS sale con su propio estilo), así que este se dibuja con los mismos colores en
// todos los dispositivos. Es un `<details>` con enlaces: sin JavaScript también abre y navega.
export function Dropdown({
  id,
  labelId,
  options,
  selected,
  fallbackTitle = "",
  className = "",
  buttonClassName = "",
  optionClassName = "",
}: DropdownProps) {
  const ref = useRef<HTMLDetailsElement>(null);
  const current = options.find((option) => option.value === selected)?.title ?? fallbackTitle;

  useEffect(() => {
    const close = () => ref.current?.removeAttribute("open");
    const onPointer = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !ref.current?.open) return;
      close();
      ref.current.querySelector("summary")?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <details ref={ref} className={`group relative ${className}`}>
      <summary
        id={id}
        aria-labelledby={`${labelId} ${id}`}
        className={`flex cursor-pointer list-none items-center border border-gold bg-bg font-body [&::-webkit-details-marker]:hidden ${buttonClassName}`}
      >
        <span className="truncate">{current}</span>
        <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-gold transition-transform group-open:rotate-180" />
      </summary>
      <ul className="absolute left-0 top-full z-30 mt-1 w-full min-w-max border border-gold bg-bg py-1 shadow-sm">
        {options.map((option) => {
          const active = option.value === selected;
          return (
            <li key={option.value}>
              <Link
                href={option.href}
                scroll={false}
                aria-current={active ? "true" : undefined}
                onClick={(event) => {
                  // Elegir la opción activa no debe quitarla: solo cierra el menú.
                  if (active) event.preventDefault();
                  ref.current?.removeAttribute("open");
                }}
                className={`block px-4 py-1 font-body text-accent hover:bg-grid focus-visible:bg-grid ${active ? "bg-grid" : ""} ${optionClassName}`}
              >
                {option.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
