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

// Redes sociales: trazos simples, también marcadores hasta tener los logos oficiales.
export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.5" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.3 2.5 2 4 4.5 4.2" />
    </svg>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M8 10.5V16M8 8v.01M12 16v-5.5M12 13c0-1.7 1-2.5 2.2-2.5S16 11.3 16 13v3" />
    </svg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="6" width="18" height="12" rx="3.5" />
      <path d="M10.5 9.5v5l4-2.5z" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
