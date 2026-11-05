import Image from "next/image";
import Link from "next/link";
import { uiText } from "@/content/ui-text";
import { BRAND_IMAGES } from "@/content/brand";
import { SOCIAL_LINKS } from "@/content/social";
import { InstagramIcon, MailIcon, TikTokIcon } from "@/components/ui/icons";
import { SubscribeBar } from "./SubscribeBar";

const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  email: MailIcon,
} as const;

export function Footer() {
  return (
    <footer aria-label={uiText.footer.label} className="px-4 pb-4 font-body lg:px-8 text-sm text-muted">
      <Image
        src={BRAND_IMAGES.divider.src}
        alt=""
        width={BRAND_IMAGES.divider.width}
        height={BRAND_IMAGES.divider.height}
        className="h-auto w-full py-2"
      />
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
        <SubscribeBar />
        <div className="flex items-center gap-4">
          <ul aria-label={uiText.footer.social} className="flex items-center gap-2">
            {SOCIAL_LINKS.map(({ id, label, href, external }) => {
              const Icon = SOCIAL_ICONS[id];
              const className = "text-accent hover:text-gold";
              return (
                <li key={id}>
                  {external ? (
                    <a href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className={className}>
                      <Icon className="size-6" />
                    </a>
                  ) : (
                    <Link href={href} aria-label={label} className={className}>
                      <Icon className="size-6" />
                    </Link>
                  )}
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
