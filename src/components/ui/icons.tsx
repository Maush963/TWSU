import type { SVGProps } from "react";

// Iconos decorativos hechos con trazos simples. Heredan el color del texto (`currentColor`).
// Son marcadores hasta que el cliente entregue sus ilustraciones (llaves, brújula, adorno).

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function KeyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="6" r="3.5" />
      <path d="M12 9.5V22M12 16.5h3.5M12 19.5h2.5" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <svg {...base} viewBox="-4 -4 32 32" strokeWidth={0.75} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" fill="currentColor" stroke="none" />
      <g fill="currentColor" stroke="none" fontSize="3.4" textAnchor="middle">
        <text x="12" y="-0.6">N</text>
        <text x="12" y="26">S</text>
        <text x="-2.4" y="13.2">W</text>
        <text x="26.4" y="13.2">E</text>
      </g>
    </svg>
  );
}

export function OrnamentIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="5" r="2" />
      <path d="M9.5 8.5h5l1 9h-7zM9.5 17.5v3.5M12 17.5v4M14.5 17.5v3.5" />
    </svg>
  );
}
