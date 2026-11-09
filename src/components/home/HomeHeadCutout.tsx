"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

// La cabeza de la jirafa sale del banner y se mete en la cabecera (solo escritorio). Va fuera del
// contenedor con desplazamiento, que recorta lo que se sale; por eso no se mueve con el contenido
// y, para no quedarse flotando sobre la cabecera ni separarse del cuello, se oculta en cuanto la
// página se desplaza un solo píxel, y reaparece al volver arriba del todo. Es decorativa.
// Debe ser hermana del `.panel-scroll` de la Home. Medidas y posición en `home.css`.
export function HomeHeadCutout() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const scroller = element?.parentElement?.querySelector<HTMLElement>(".panel-scroll");
    if (!element || !scroller) return;

    function update() {
      if (element) element.style.visibility = (scroller?.scrollTop ?? 0) > 0 ? "hidden" : "visible";
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
