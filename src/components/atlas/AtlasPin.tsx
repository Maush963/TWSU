// Un punto del mapa, posicionado en porcentaje. Al activarlo (clic, Enter o Espacio) su caso
// pasa al panel derecho. El seleccionado invierte los colores (insignia dorada con borde y centro verdes)
// y hace un parpadeo suave al elegirlo (.atlas-pin-blink en atlas.css).
interface AtlasPinProps {
  pin: {
    id: string;
    title: string;
    placeName: string;
    displayX: number;
    displayY: number;
  };
  selected: boolean;
  onSelect: (id: string) => void;
}

// Insignia de borde ondulado (8 lóbulos) del diseño.
const BADGE_PATH =
  "M23.5 12.0 L23.1 13.1 L22.2 14.0 L21.2 14.8 L20.6 15.6 L20.5 16.5 L20.6 17.8 L20.6 19.1 L20.1 20.1 L19.1 20.6 L17.8 20.6 L16.5 20.5 L15.6 20.6 L14.8 21.2 L14.0 22.2 L13.1 23.1 L12.0 23.5 L10.9 23.1 L10.0 22.2 L9.2 21.2 L8.4 20.6 L7.5 20.5 L6.2 20.6 L4.9 20.6 L3.9 20.1 L3.4 19.1 L3.4 17.8 L3.5 16.5 L3.4 15.6 L2.8 14.8 L1.8 14.0 L0.9 13.1 L0.5 12.0 L0.9 10.9 L1.8 10.0 L2.8 9.2 L3.4 8.4 L3.5 7.5 L3.4 6.2 L3.4 4.9 L3.9 3.9 L4.9 3.4 L6.2 3.4 L7.5 3.5 L8.4 3.4 L9.2 2.8 L10.0 1.8 L10.9 0.9 L12.0 0.5 L13.1 0.9 L14.0 1.8 L14.8 2.8 L15.6 3.4 L16.5 3.5 L17.8 3.4 L19.1 3.4 L20.1 3.9 L20.6 4.9 L20.6 6.2 L20.5 7.5 L20.6 8.4 L21.2 9.2 L22.2 10.0 L23.1 10.9z";

export function AtlasPin({ pin, selected, onSelect }: AtlasPinProps) {
  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 ${selected ? "z-20" : "hover:z-10"}`}
      style={{ left: `${pin.displayX}%`, top: `${pin.displayY}%` }}
    >
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`${pin.title}, ${pin.placeName}`}
        onClick={() => onSelect(pin.id)}
        className="relative block size-pin cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={`size-full drop-shadow ${selected ? "atlas-pin-blink" : ""}`}
        >
          <path d={BADGE_PATH} className={selected ? "fill-gold stroke-accent" : "fill-pin"} strokeWidth="2" />
          <circle cx="12" cy="12" r="6.6" className={`fill-none ${selected ? "stroke-accent" : "stroke-gold"}`} strokeWidth="1.4" />
          <circle cx="12" cy="12" r="3.6" className={selected ? "fill-accent" : "fill-gold"} />
        </svg>
      </button>
    </div>
  );
}
