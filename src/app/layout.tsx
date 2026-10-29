import type { Metadata } from "next";
import "./globals.css";
import { albra, iowan, myriad } from "./fonts";
import { uiText } from "@/content/ui-text";
import { publicEnv } from "@/lib/env";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: uiText.meta.title,
    template: uiText.meta.titleTemplate,
  },
  description: uiText.meta.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${albra.variable} ${iowan.variable} ${myriad.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a href="#contenido" className="sr-only focus:not-sr-only">
          {uiText.common.skipToContent}
        </a>
        <Header />
        <div id="contenido" className="flex min-h-0 flex-1 flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
