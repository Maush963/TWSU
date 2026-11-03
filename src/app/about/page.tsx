import type { Metadata } from "next";
import { AboutIntro } from "@/components/about/AboutIntro";
import { CouncilOfFive } from "@/components/about/CouncilOfFive";
import { uiText } from "@/content/ui-text";

export const metadata: Metadata = { title: uiText.about.title };

// En escritorio la página mide el alto de la ventana y el contenido se desplaza dentro, con el
// pie siempre a la vista. En móvil sigue el flujo normal y conserva el pie.
export default function AboutPage() {
  return (
    <main lang={uiText.meta.locale} className="panel-page panel-page-footer flex min-h-0 flex-1 flex-col">
      <div className="panel-scroll about-scroll flex-1">
        <AboutIntro />
        <CouncilOfFive />
      </div>
    </main>
  );
}
