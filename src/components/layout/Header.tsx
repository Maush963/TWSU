import Link from "next/link";
import { uiText } from "@/content/ui-text";
import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ArrowRightIcon, SearchIcon } from "@/components/ui/icons";

const LINKS = [
  { href: "/", label: uiText.nav.home },
  { href: "/perspectives", label: uiText.nav.perspectives },
  { href: "/about", label: uiText.nav.about },
] as const;

export function Header() {
  return (
    <header className="relative z-50 flex items-center justify-between gap-4 bg-surface px-4 py-2 lg:px-8">
      <Logo />
      <div className="hidden flex-1 items-center justify-between gap-6 lg:flex">
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
          href="/perspectives"
          className="flex items-center gap-2 font-ui uppercase tracking-caps hover:text-accent"
        >
          <SearchIcon className="size-4" />
          {uiText.nav.search}
        </Link>
        <Link
          href="/atlas"
          className="flex items-center gap-3 bg-accent px-5 py-3 font-ui uppercase tracking-caps text-surface hover:bg-pin"
        >
          {uiText.nav.exploreAtlas}
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
      <MobileMenu links={LINKS} />
    </header>
  );
}
