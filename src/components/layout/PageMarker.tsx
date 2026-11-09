"use client";

import { useLayoutEffect, useRef } from "react";

// Next conserva las páginas anteriores ocultas con `display: none` (React Activity) en lugar de
// quitarlas del DOM. Los selectores `body:has(.atlas-page)` y `body:has(.panel-page)` las seguían
// encontrando y dejaban la Home con el alto de la ventana, con el pie encima de los artículos.
// Este marcador pone `data-hidden` en la página (su elemento padre) mientras está oculta, y los
// estilos de `atlas.css` y `perspectives.css` la ignoran con `:not([data-hidden])`. Ver
// node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md.
// Va como hijo directo del `main` que lleva la clase de la página.
export function PageMarker() {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const page = ref.current?.parentElement;
    page?.removeAttribute("data-hidden");
    return () => page?.setAttribute("data-hidden", "");
  }, []);

  return <span ref={ref} hidden />;
}
