import Link from "next/link";
import { uiText } from "@/content/ui-text";
import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";

const LINKS = [
  { href: "/", label: uiText.nav.home },
  { href: "/perspectives", label: uiText.nav.perspectives },
  { href: "/about", label: uiText.nav.about },
] as const;

export function Header() {
  return (
    <header className="relative z-50 flex items-center justify-between gap-4 bg-surface px-4 py-2 lg:px-8 lg:py-4">
      <Logo />
      <div className="hidden flex-1 items-center lg:flex lg:pl-24">
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
      </div>
      <MobileMenu links={LINKS} />
    </header>
  );
}
