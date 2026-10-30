import Link from "next/link";
import { uiText } from "@/content/ui-text";
import { SOCIAL_LINKS } from "@/content/social";
import { InstagramIcon, LinkedInIcon, OrnamentIcon, TikTokIcon, YouTubeIcon } from "@/components/ui/icons";
import { SubscribeBar } from "./SubscribeBar";

// Privacy todavía no tiene página (pendiente del cliente): se muestra como texto, sin enlace.
const LINKS = [
  { label: uiText.footer.tagline, href: null },
  { label: uiText.footer.contact, href: "/join" },
  { label: uiText.footer.privacy, href: null },
] as const;

const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  linkedin: LinkedInIcon,
  youtube: YouTubeIcon,
} as const;

export function Footer() {
  return (
    <footer aria-label={uiText.footer.label} className="px-4 pb-4 font-body lg:px-8 text-sm text-muted">
      <div aria-hidden="true" className="flex items-center gap-4 py-2 text-gold">
        <hr className="flex-1 border-gold-soft" />
        <OrnamentIcon className="size-6" />
        <hr className="flex-1 border-gold-soft" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
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
        <SubscribeBar />
        <div className="flex items-center gap-4">
          <ul aria-label={uiText.footer.social} className="flex items-center gap-2">
            {SOCIAL_LINKS.map(({ id, label, href }) => {
              const Icon = SOCIAL_ICONS[id];
              return (
                <li key={id}>
                  <a
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-gold"
                  >
                    <Icon className="size-6" />
                  </a>
                </li>
              );
            })}
          </ul>
          <p>
            {uiText.footer.brand}
            <sup>®</sup>
          </p>
        </div>
      </div>
    </footer>
  );
}
