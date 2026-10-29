"use client";

import { useEffect } from "react";

// Escape cierra los tooltips abiertos. Vuelven a aparecer cuando el usuario mueve el cursor
// o pasa el foco a otro punto. No renderiza nada.
export function AtlasTooltipDismiss({ targetId }: { targetId: string }) {
  useEffect(() => {
    const map = document.getElementById(targetId);
    if (!map) return;

    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") map.dataset.tooltipsDismissed = "true";
    };
    const restore = () => {
      delete map.dataset.tooltipsDismissed;
    };

    document.addEventListener("keydown", dismiss);
    map.addEventListener("pointermove", restore);
    map.addEventListener("focusin", restore);
    return () => {
      document.removeEventListener("keydown", dismiss);
      map.removeEventListener("pointermove", restore);
      map.removeEventListener("focusin", restore);
    };
  }, [targetId]);

  return null;
}
