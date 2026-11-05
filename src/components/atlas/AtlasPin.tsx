// Un punto del mapa, posicionado en porcentaje. Al activarlo (clic, Enter o Espacio) su caso
// pasa al panel derecho. El seleccionado lleva encima un pin de ubicación (gota con punta) cuya
// punta cae justo sobre el punto.
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
        className="relative block size-pin cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-full drop-shadow"
        >
          <circle cx="12" cy="12" r="11.5" className="fill-gold" />
          <circle cx="12" cy="12" r="9" className="fill-pin" />
          <circle cx="12" cy="12" r="4" className="fill-gold" />
          <circle cx="12" cy="12" r="2" className="fill-pin" />
        </svg>
        {selected && (
          <svg
            viewBox="0 0 24 32"
            aria-hidden="true"
            className="pointer-events-none absolute bottom-1/2 left-1/2 h-auto w-pin -translate-x-1/2 drop-shadow"
          >
            <path
              d="M12 31C12 31 1.5 19 1.5 12a10.5 10.5 0 0 1 21 0C22.5 19 12 31 12 31z"
              className="fill-accent stroke-gold"
              strokeWidth="1.2"
            />
            <circle cx="12" cy="12" r="4.5" className="fill-gold" />
          </svg>
        )}
      </button>
    </div>
  );
}
