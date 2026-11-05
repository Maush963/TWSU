import localFont from "next/font/local";

// Títulos. Es la versión TRIAL: hace falta la licencia completa antes de publicar el sitio.
export const albra = localFont({
  src: "./fonts/AlbraSansTRIAL-Regular.otf",
  variable: "--font-albra",
  display: "swap",
});

// Texto, navegación, botones y etiquetas: en el diseño todo lo que no es título va en Iowan Old Style (Bitstream).
export const iowan = localFont({
  src: [
    { path: "./fonts/IowanOldStyle-Roman.ttf", weight: "400", style: "normal" },
    { path: "./fonts/IowanOldStyle-Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/IowanOldStyle-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/IowanOldStyle-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "./fonts/IowanOldStyle-Black.ttf", weight: "900", style: "normal" },
    { path: "./fonts/IowanOldStyle-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
  variable: "--font-iowan",
  display: "swap",
});
