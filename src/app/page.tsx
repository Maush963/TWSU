import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageMarker } from "@/components/layout/PageMarker";
import { HomeFeatured } from "@/components/home/HomeFeatured";
import { uiText } from "@/content/ui-text";
import { getFeaturedArticle, getRecentArticles } from "@/lib/data/articles";
import { HOME_RECENT_LIMIT } from "@/lib/constants";

export const metadata: Metadata = { title: uiText.home.title };

export default async function HomePage() {
  // El destacado va primero y los más recientes completan la fila, sin repetirlo.
  const featured = await getFeaturedArticle();
  const recent = await getRecentArticles(HOME_RECENT_LIMIT, featured?.id);
  const articles = [...(featured ? [featured] : []), ...recent].slice(0, HOME_RECENT_LIMIT);

  return (
    <main lang={uiText.meta.locale} className="home-page panel-page panel-page-footer flex min-h-0 flex-1 flex-col">
      <PageMarker />
      <div className="panel-scroll flex-1">
        <section aria-labelledby="home-hero-title" className="home-banner bg-bg">
          <div className="home-banner-art">
            <Image
              src="/home/hero-home.webp"
              alt=""
              fill
              sizes="(min-width: 64rem) 62vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="home-banner-copy">
            <h1
              id="home-hero-title"
              className="mb-4 font-display text-2xl uppercase leading-none text-accent lg:text-3xl"
            >
              {uiText.home.bannerTitle}
            </h1>
            <p className="font-ui leading-tight">{uiText.home.heroDescription}</p>
            <div className="mt-8">
              <Link href="/about" className="border-b border-gold py-1 font-ui uppercase tracking-caps hover:text-accent">
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
