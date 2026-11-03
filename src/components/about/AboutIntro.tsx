import Image from "next/image";
import { uiText } from "@/content/ui-text";

// Hero y los cuatro bloques (Who, What, Why, How). Usa los textos y estilos de la Home.
export function AboutIntro() {
  return (
    <>
      <section aria-labelledby="about-hero-title" className="home-hero bg-bg">
        <div className="home-hero-image">
          <Image
            src="/home/222Characters_ProfilesCOMP.png"
            alt=""
            fill
            sizes="(max-width: 48rem) 100vw, 62vw"
            className="object-contain object-right-bottom"
            priority
          />
        </div>
        <div className="home-hero-copy">
          <h1 id="about-hero-title" className="mb-2 font-body text-4xl uppercase leading-tight text-accent">
            {uiText.home.heroTitle}
          </h1>
          <p className="font-ui leading-tight">{uiText.home.heroDescription}</p>
          <p className="mt-4 font-ui leading-tight">{uiText.home.heroBelief}</p>
        </div>
      </section>
      <section aria-label={uiText.about.overviewLabel} className="home-overview bg-surface">
        <dl className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-12">
          {uiText.home.values.map((value) => (
            <div key={value.title} className="border-l border-gold pl-5">
              <dt className="mb-2 font-body text-3xl uppercase leading-none text-accent">{value.title}</dt>
              <dd className="font-ui leading-tight">{value.description}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
