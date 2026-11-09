"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

// La cabeza de la jirafa sale del banner y se mete en la cabecera (solo escritorio). Va fuera del
// contenedor con desplazamiento, que recorta lo que se sale; por eso no se mueve sola: se desplaza
// y se desvanece con el contenido para no quedarse flotando sobre la cabecera. Es decorativa.
// Con un poco de desplazamiento (FADE_DISTANCE) desaparece del todo.
// Debe ser hermana del `.panel-scroll` de la Home. Medidas y posición en `home.css`.
const FADE_DISTANCE = 24;

export function HomeHeadCutout() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const scroller = element?.parentElement?.querySelector<HTMLElement>(".panel-scroll");
    if (!element || !scroller) return;

    function update() {
      const offset = scroller?.scrollTop ?? 0;
      element?.style.setProperty("--home-scroll", `${offset}px`);
      if (!element) return;
      const opacity = Math.max(0, 1 - offset / FADE_DISTANCE);
      element.style.opacity = String(opacity);
      element.style.visibility = opacity === 0 ? "hidden" : "visible";
    }

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    return () => scroller.removeEventListener("scroll", update);
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="home-cutout">
      <Image src="/home/jirafa-cabeza.webp" alt="" width={200} height={130} sizes="10vw" className="h-auto w-full" />
    </div>
  );
}
