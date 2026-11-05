import Link from "next/link";
import { uiText } from "@/content/ui-text";
import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ArrowRightIcon } from "@/components/ui/icons";

const LINKS = [
  { href: "/", label: uiText.nav.home },
  { href: "/perspectives", label: uiText.nav.perspectives },
  { href: "/about", label: uiText.nav.about },
] as const;

export function Header() {
  return (
    <header className="relative z-50 flex items-center justify-between gap-4 bg-surface px-4 pb-3 pt-5 lg:px-8 lg:py-[0.92rem]">
      <Logo />
      <div className="header-nav hidden flex-1 items-center lg:flex lg:justify-between lg:pl-24">
        <nav aria-label={uiText.nav.label}>
          <ul className="flex gap-16 font-ui text-lg uppercase tracking-caps">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* No se muestra en la propia página del Atlas (ver atlas.css). */}
        <Link
          href="/atlas"
          className="explore-atlas-link flex items-center gap-3 bg-accent px-5 py-3 font-ui uppercase tracking-caps text-surface hover:bg-pin"
        >
          {uiText.nav.exploreAtlas}
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
      <MobileMenu links={LINKS} />
    </header>
  );
}
