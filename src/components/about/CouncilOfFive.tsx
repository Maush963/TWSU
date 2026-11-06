import type { CSSProperties } from "react";
import Image from "next/image";
import { CHARACTERS } from "@/content/characters";
import { KEY_IMAGES } from "@/content/brand";
import { uiText } from "@/content/ui-text";

export function CouncilOfFive() {
  return (
    <section aria-labelledby="council-title" className="about-council bg-surface">
      {/* Fondo decorativo: un cielo que se funde con el color de la página y llega de borde a borde. */}
      <div aria-hidden="true" className="about-council-bg">
        <Image
          src="/about/fondo-consejo.webp"
          alt={uiText.about.councilBackgroundAlt}
          fill
          sizes="100vw"
          className="origin-bottom scale-125 object-cover object-bottom opacity-60"
        />
      </div>

      <div className="flex flex-col items-center gap-3 pb-10 text-center lg:flex-row lg:flex-wrap lg:items-end lg:justify-between lg:gap-x-8 lg:text-left">
        <h2 id="council-title" className="font-display text-2xl uppercase leading-none text-accent">
          {uiText.about.councilTitle}
        </h2>
        <p className="font-body text-xs uppercase tracking-caps-wide">{uiText.about.councilSubtitle}</p>
      </div>

      <ul className="about-cards grid grid-cols-1 gap-y-8 lg:grid-cols-5 lg:gap-x-6">
        {CHARACTERS.map((character) => (
          <li key={character.id} className="about-card lg:flex lg:flex-col lg:gap-4">
            <Image
              src={character.image}
              alt={character.alt}
              width={720}
              height={675}
              sizes="(min-width: 64rem) 17vw, 45vw"
              className="about-card-image"
            />
            <div className="about-card-body flex flex-col gap-4 lg:contents">
              <div className="flex items-start justify-between gap-3 border-b border-gold pb-3 lg:pb-4">
                <h3 className="min-w-0 font-display text-xl uppercase leading-none text-accent">
                  {character.nameLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h3>
                <Image
                  src={KEY_IMAGES[character.key].src}
                  alt=""
                  width={KEY_IMAGES[character.key].width}
                  height={KEY_IMAGES[character.key].height}
                  className="about-key h-auto shrink-0"
                  style={{ "--key-ink-top": KEY_IMAGES[character.key].inkTop / KEY_IMAGES[character.key].width } as CSSProperties}
                />
              </div>
              <p className="font-body text-sm italic uppercase tracking-caps">{character.category}</p>
              <p className="font-body">{character.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
