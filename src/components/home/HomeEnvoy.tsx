"use client";

import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { useSubscribe } from "@/components/layout/useSubscribe";
import { uiText } from "@/content/ui-text";

// Bloque del boletín de la Home: el boceto de los personajes a la izquierda y, a la derecha, el
// texto y el formulario dentro del marco tipo sello. En escritorio el formulario del pie se oculta
// (ver `home.css`), así que este es el único.
export function HomeEnvoy() {
  const { status, onSubmit } = useSubscribe();
  const text = uiText.home.envoy;

  return (
    <section aria-labelledby="home-envoy-title" className="home-envoy">
      <Image
        src="/home/envoy-ilustracion.webp"
        alt={text.illustrationAlt}
        width={1100}
        height={923}
        sizes="(min-width: 64rem) 40vw, 80vw"
        className="home-envoy-art"
      />
      <div className="home-envoy-card">
        <h2 id="home-envoy-title" className="font-display uppercase leading-none text-accent">
          {text.title}
        </h2>
        <p className="mt-6 font-body text-base lg:text-lg">{text.description}</p>
        <p className="mt-6 font-body text-sm italic lg:text-base">{text.note}</p>
        <form onSubmit={onSubmit} className="home-envoy-form">
          <label htmlFor="envoy-email" className="font-ui text-xs uppercase tracking-caps lg:text-sm">
            {text.label}
          </label>
          <Input
            id="envoy-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={text.emailPlaceholder}
            className="home-envoy-input min-w-0 flex-1 text-sm"
          />
          {/* Campo trampa: las personas no lo ven ni lo llenan. */}
          <div aria-hidden="true" className="absolute left-0 top-0 h-0 w-0 overflow-hidden opacity-0">
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="bg-accent px-5 py-2 font-ui text-xs uppercase tracking-caps text-surface hover:bg-pin disabled:opacity-50 lg:text-sm"
          >
            {status === "sending" ? uiText.subscribe.sending : text.submit}
          </button>
        </form>
        <p role="status" className="mt-3 min-h-6 text-sm">
          {status === "success" && uiText.subscribe.success}
          {status === "error" && uiText.subscribe.error}
        </p>
      </div>
    </section>
  );
}
