import Image from "next/image";
import Link from "next/link";
import { BRAND_IMAGES } from "@/content/brand";
import { uiText } from "@/content/ui-text";

// Logo del cliente: las llaves y el nombre en una sola imagen.
export function Logo() {
  return (
    <Link href="/" className="block">
      <Image
        src={BRAND_IMAGES.logo.src}
        alt={uiText.nav.logo}
        width={BRAND_IMAGES.logo.width}
        height={BRAND_IMAGES.logo.height}
        priority
        className="h-10 w-auto lg:h-[3.68rem]"
      />
    </Link>
  );
}
