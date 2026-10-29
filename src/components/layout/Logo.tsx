import Link from "next/link";
import { uiText } from "@/content/ui-text";
import { KeyIcon } from "@/components/ui/icons";

// Marcador del logo: llaves y nombre en dos líneas. Se reemplaza por el logo del cliente cuando llegue.
export function Logo() {
  return (
    <Link href="/" aria-label={uiText.nav.logo} className="flex items-center gap-4 text-accent">
      <span aria-hidden="true" className="flex items-end text-gold">
        <KeyIcon className="size-8 -rotate-12" />
        <KeyIcon className="-ml-2 size-8" />
        <KeyIcon className="-ml-2 size-8 rotate-12" />
      </span>
      <span className="font-display text-xl uppercase leading-none tracking-caps">
        <span className="block">{uiText.nav.logoLine1}</span>
        <span className="block">{uiText.nav.logoLine2}</span>
      </span>
    </Link>
  );
}
