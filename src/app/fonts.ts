import localFont from "next/font/local";

// Títulos. Es la versión TRIAL: hace falta la licencia completa antes de publicar el sitio.
export const albra = localFont({
  src: "./fonts/AlbraSansTRIAL-Regular.otf",
  variable: "--font-albra",
  display: "swap",
});

// Texto secundario. Extraída de Iowan Old Style.ttc (los navegadores no leen .ttc).
export const iowan = localFont({
  src: [
    { path: "./fonts/IowanOldStyle-Roman.ttf", weight: "400", style: "normal" },
    { path: "./fonts/IowanOldStyle-Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/IowanOldStyle-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-iowan",
  display: "swap",
});

// Navegación, botones y etiquetas.
export const myriad = localFont({
  src: "./fonts/MyriadPro-Regular.otf",
  variable: "--font-myriad",
  display: "swap",
});
