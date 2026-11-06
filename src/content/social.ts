// Redes del pie. Las direcciones son las páginas principales de cada red hasta que el cliente
// entregue sus perfiles; ver docs/decisiones-tecnicas.md.
// El correo lleva al campo de suscripción del pie (no hay página de contacto) hasta que el cliente
// entregue su dirección; entonces el `href` pasa a `mailto:` y `external` a `true`.
export const SOCIAL_LINKS = [
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/", external: true },
  { id: "tiktok", label: "TikTok", href: "https://www.tiktok.com/", external: true },
  { id: "email", label: "Email", href: "#subscribe-email", external: false },
] as const;
