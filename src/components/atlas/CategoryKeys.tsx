import { uiText } from "@/content/ui-text";
import { KeyIcon } from "@/components/ui/icons";
import type { KeyState } from "@/lib/atlas/keys";

// Las 5 llaves, siempre en el mismo orden. El estado no depende solo del color:
// la llave encendida va con trazo grueso y la apagada con trazo discontinuo.
export function CategoryKeys({ states }: { states: KeyState[] }) {
  return (
    <ul aria-label={uiText.atlas.keys.label} className="flex items-center gap-2">
      {states.map((state) => (
        <li key={state.category} className={state.active ? "text-gold" : "text-gold-soft"}>
          <KeyIcon
            className="size-key"
            strokeWidth={state.active ? 2 : 1}
            strokeDasharray={state.active ? undefined : "2 2"}
          />
          <span className="sr-only">
            {state.title}, {state.active ? uiText.atlas.keys.on : uiText.atlas.keys.off}
          </span>
        </li>
      ))}
    </ul>
  );
}
