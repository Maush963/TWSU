// Un punto del mapa, posicionado en porcentaje. Al activarlo (clic, Enter o Espacio) su caso
// pasa al panel derecho. El seleccionado crece y lleva un anillo pulsante para distinguirlo.
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
        className={`relative block size-pin cursor-pointer rounded-full transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${selected ? "scale-150" : "hover:scale-125"}`}
      >
        {selected && (
          <span
            aria-hidden="true"
            className="absolute -inset-1 animate-ping rounded-full ring-2 ring-accent"
          />
        )}
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="relative size-full drop-shadow"
        >
          <circle
            cx="12"
            cy="12"
            r="11.5"
            className={selected ? "fill-accent" : "fill-gold"}
          />
          <circle cx="12" cy="12" r="9" className="fill-pin" />
          <circle cx="12" cy="12" r="4" className="fill-gold" />
          <circle cx="12" cy="12" r="2" className="fill-pin" />
        </svg>
      </button>
    </div>
  );
}
