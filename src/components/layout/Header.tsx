import Link from "next/link";
import { uiText } from "@/content/ui-text";
import { Logo } from "@/components/layout/Logo";
import { ArrowRightIcon } from "@/components/ui/icons";

const LINKS = [
  { href: "/", label: uiText.nav.home },
  { href: "/perspectives", label: uiText.nav.perspectives },
  { href: "/about", label: uiText.nav.about },
] as const;

export function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 bg-surface px-8 py-4">
      <Logo />
      <nav aria-label={uiText.nav.label}>
        <ul className="flex gap-8 font-ui uppercase tracking-caps">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-accent">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <Link
        href="/atlas"
        className="flex items-center gap-4 bg-accent px-8 py-4 font-ui uppercase tracking-caps text-surface"
      >
        {uiText.nav.exploreAtlas}
        <ArrowRightIcon className="size-4" />
      </Link>
    </header>
  );
}
