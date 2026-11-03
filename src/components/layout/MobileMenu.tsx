"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { uiText } from "@/content/ui-text";
import { ArrowRightIcon, CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";

interface MobileMenuProps {
  links: readonly { href: string; label: string }[];
}

// Menú de la cabecera en pantallas chicas: un botón que despliega los enlaces de navegación.
export function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const Icon = open ? CloseIcon : MenuIcon;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? uiText.nav.menuClose : uiText.nav.menuOpen}
        onClick={() => setOpen((value) => !value)}
        className="flex size-12 items-center justify-center bg-accent text-surface"
      >
        <Icon className="size-8" />
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label={uiText.nav.label}
          className="absolute inset-x-0 top-full z-40 bg-surface shadow-lg"
        >
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href} className="border-t border-gold-soft">
                <Link href={link.href} onClick={() => setOpen(false)} className="block px-4 py-4 font-ui uppercase tracking-caps text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-gold-soft">
              <Link
                href="/perspectives"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-4 font-ui uppercase tracking-caps text-accent"
              >
                <SearchIcon className="size-4" />
                {uiText.nav.search}
              </Link>
            </li>
            <li className="border-t border-gold-soft p-4">
              <Link
                href="/atlas"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-3 bg-accent px-5 py-4 font-ui uppercase tracking-caps text-surface"
              >
                {uiText.nav.exploreAtlas}
                <ArrowRightIcon className="size-4" />
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
