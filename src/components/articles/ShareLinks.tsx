import { CopyLinkButton } from "@/components/articles/CopyLinkButton";
import { FacebookIcon, LinkedInIcon, XIcon } from "@/components/ui/icons";
import { uiText } from "@/content/ui-text";
import { buildShareLinks } from "@/lib/articles/share";

interface ShareLinksProps {
  url: string;
  title: string;
  className?: string;
}

export function ShareLinks({ url, title, className = "" }: ShareLinksProps) {
  const links = buildShareLinks(url, title);
  const networks = [
    { href: links.facebook, label: uiText.article.shareOn.facebook, Icon: FacebookIcon },
    { href: links.x, label: uiText.article.shareOn.x, Icon: XIcon },
    { href: links.linkedin, label: uiText.article.shareOn.linkedin, Icon: LinkedInIcon },
  ];

  return (
    <div className={`flex items-center justify-end gap-4 font-body text-muted ${className}`}>
      <span>{uiText.article.share}</span>
      <span aria-hidden className="text-gold">
        •
      </span>
      <ul className="flex items-center gap-4">
        {networks.map(({ href, label, Icon }) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="hover:text-accent">
              <Icon className="size-5" />
            </a>
          </li>
        ))}
        <li>
          <CopyLinkButton url={url} label={uiText.article.copyLink} copiedLabel={uiText.article.linkCopied} />
        </li>
      </ul>
    </div>
  );
}
