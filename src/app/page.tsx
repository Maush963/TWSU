import type { Metadata } from "next";
import { getImageProps } from "next/image";
import Image from "next/image";
import Link from "next/link";
import { PageMarker } from "@/components/layout/PageMarker";
import { ArrowRightIcon } from "@/components/ui/icons";
import { HomeFeatured } from "@/components/home/HomeFeatured";
import { HomeHeadCutout } from "@/components/home/HomeHeadCutout";
import { uiText } from "@/content/ui-text";
import { getFeaturedArticle, getRecentArticles } from "@/lib/data/articles";
import { HOME_RECENT_LIMIT } from "@/lib/constants";

export const metadata: Metadata = { title: uiText.home.title };

export default async function HomePage() {
  // El destacado va primero y los más recientes completan la fila, sin repetirlo.
  const featured = await getFeaturedArticle();
  const recent = await getRecentArticles(HOME_RECENT_LIMIT, featured?.id);
  const articles = [...(featured ? [featured] : []), ...recent].slice(0, HOME_RECENT_LIMIT);

  // La misma foto, sin la cabeza de la jirafa, en móvil y en escritorio: la cabeza va aparte y sobresale
  // sobre la cabecera. Ver scripts/prepare-home.mjs.
  const { props: photoProps } = getImageProps({
    alt: "",
    fill: true,
    sizes: "(min-width: 64rem) 75vw, 120vw",
    className: "object-cover",
    src: "/home/hero-home-desktop.webp",
    priority: true,
  });

  return (
    <main
      lang={uiText.meta.locale}
      className="home-page panel-page panel-page-footer relative flex min-h-0 flex-1 flex-col"
    >
      <PageMarker />
      <HomeHeadCutout />
      <div className="panel-scroll flex-1">
        <section aria-labelledby="home-hero-title" className="home-banner">
          <div className="home-banner-media">
            <div className="home-banner-art">
              <img {...photoProps} alt="" />
            </div>
            {/* Cabeza de la jirafa en móvil; en escritorio la dibuja HomeHeadCutout. */}
            <Image
              src="/home/jirafa-cabeza.webp"
              alt=""
              aria-hidden="true"
              width={200}
              height={130}
              sizes="20vw"
              className="home-cutout-mobile h-auto"
            />
          </div>
          <div className="home-banner-copy">
            <h1
              id="home-hero-title"
              className="mb-4 font-display text-[2.75rem] uppercase leading-none text-accent lg:text-3xl"
            >
              {uiText.home.bannerTitle.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="font-ui leading-tight">{uiText.home.heroDescription}</p>
            <div className="mt-8 lg:mt-6 flex flex-wrap items-center gap-x-10 gap-y-4">
              {/* En escritorio el acceso al Atlas está en la cabecera; en móvil no hay botón ahí. */}
              <Link
                href="/atlas"
                className="flex items-center gap-2 bg-accent px-4 py-3 font-ui text-xs uppercase tracking-caps text-surface hover:bg-pin sm:gap-3 sm:px-5 sm:text-base lg:hidden"
              >
                {uiText.nav.exploreAtlas}
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link href="/about" className="border-b border-gold py-1 font-ui text-xs uppercase tracking-caps hover:text-accent lg:text-base">
                {uiText.home.learnMore}
              </Link>
            </div>
          </div>
        </section>
        <HomeFeatured articles={articles} />
      </div>
    </main>
  );
}
