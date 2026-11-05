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

      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 pb-8">
        <h2 id="council-title" className="font-display text-2xl uppercase leading-none text-accent">
          {uiText.about.councilTitle}
        </h2>
        <p className="font-body text-xs uppercase tracking-caps-wide">{uiText.about.councilSubtitle}</p>
      </div>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-5 lg:gap-x-6">
        {CHARACTERS.map((character) => (
          <li key={character.id} className="flex flex-col gap-4">
            <Image
              src={character.image}
              alt={character.alt}
              width={720}
              height={675}
              sizes="(min-width: 64rem) 17vw, 50vw"
              className="about-card-image"
            />
            <div className="flex items-start justify-between gap-2 border-b border-gold pb-4">
              <h3 className="font-display text-xl uppercase leading-none text-accent">
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
                className="mt-1 h-auto w-16 shrink-0"
              />
            </div>
            <p className="font-body text-sm italic uppercase tracking-caps">{character.category}</p>
            <p className="font-body">{character.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
