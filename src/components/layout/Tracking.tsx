import Script from "next/script";
import { publicEnv } from "@/lib/env";
import { buildTrackingScripts } from "@/lib/tracking/scripts";

// Carga el tag de Google y los pixels solo con los identificadores que entregó el cliente.
// Sin ninguno no pinta nada. Se cargan después de que la página es interactiva.
export function Tracking() {
  const scripts = buildTrackingScripts({
    google: publicEnv.NEXT_PUBLIC_GOOGLE_TAG_ID,
    meta: publicEnv.NEXT_PUBLIC_META_PIXEL_ID,
    tiktok: publicEnv.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
  });

  return (
    <>
      {scripts.map(({ id, src, code }) =>
        src ? (
          <Script key={id} id={id} src={src} strategy="afterInteractive" />
        ) : (
          <Script key={id} id={id} strategy="afterInteractive">
            {code}
          </Script>
        ),
      )}
    </>
  );
}
