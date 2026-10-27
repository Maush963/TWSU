import Link from "next/link";
import { uiText } from "@/content/ui-text";

const LINKS = [
  { href: "/atlas", label: uiText.nav.atlas },
  { href: "/perspectives", label: uiText.nav.perspectives },
  { href: "/about", label: uiText.nav.about },
  { href: "/join", label: uiText.nav.join },
] as const;

export function Header() {
  return (
    <header className="flex items-center justify-between gap-4 p-4">
      <Link href="/" className="font-display text-xl">
        {uiText.nav.logo}
      </Link>
      <nav aria-label={uiText.nav.label}>
        <ul className="flex gap-4">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
