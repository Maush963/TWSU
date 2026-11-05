import Image from "next/image";
import { KEY_IMAGES } from "@/content/brand";
import { uiText } from "@/content/ui-text";
import type { KeyState } from "@/lib/atlas/keys";

// Las 5 llaves, siempre en el mismo orden y en abanico, como en el diseño. La llave de las
// categorías del caso va a todo color; las demás, tenues. El texto para lectores de pantalla
// dice el estado, así no depende solo del color.
export function CategoryKeys({ states }: { states: KeyState[] }) {
  return (
    <ul
      aria-label={uiText.atlas.keys.label}
      className="flex shrink-0 items-center px-8"
    >
      {states.map((state) => {
        const image = KEY_IMAGES[state.category];
        return (
          <li key={state.category} className="relative h-key-box w-key-step">
            <Image
              src={image.src}
              alt=""
              width={image.width}
              height={image.height}
              className={`absolute left-1/2 top-1/2 h-auto w-key-box max-w-none -translate-x-1/2 -translate-y-1/2 rotate-60 ${state.active ? "" : "opacity-30"}`}
            />
            <span className="sr-only">
              {state.title},{" "}
              {state.active ? uiText.atlas.keys.on : uiText.atlas.keys.off}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
