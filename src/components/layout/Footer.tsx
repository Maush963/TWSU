import Link from "next/link";
import { uiText } from "@/content/ui-text";
import { OrnamentIcon } from "@/components/ui/icons";

// Privacy todavía no tiene página (pendiente del cliente): se muestra como texto, sin enlace.
const LINKS = [
  { label: uiText.footer.tagline, href: null },
  { label: uiText.footer.contact, href: "/join" },
  { label: uiText.footer.privacy, href: null },
] as const;

export function Footer() {
  return (
    <footer aria-label={uiText.footer.label} className="px-8 pb-8 font-body text-muted">
      <div aria-hidden="true" className="flex items-center gap-4 py-4 text-gold">
        <hr className="flex-1 border-gold-soft" />
        <OrnamentIcon className="size-8" />
        <hr className="flex-1 border-gold-soft" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ul className="flex flex-wrap items-center gap-4">
          {LINKS.map((link, index) => (
            <li key={link.label} className="flex items-center gap-4">
              {index > 0 && (
                <span aria-hidden="true" className="text-gold">
                  •
                </span>
              )}
              {link.href ? (
                <Link href={link.href} className="hover:text-accent">
                  {link.label}
                </Link>
              ) : (
                <span>{link.label}</span>
              )}
            </li>
          ))}
        </ul>
        <p>
          {uiText.footer.brand}
          <sup>®</sup>
        </p>
      </div>
    </footer>
  );
}
